import logging
import time

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from mangum import Mangum

from app.api import api_router
from app.core.config import get_settings


# ---------------------------------------------------------------------------
# Structured logging - outputs to CloudWatch in Lambda
# ---------------------------------------------------------------------------
# Lambda pre-configures the root logger, so basicConfig is a no-op there.
# Instead, we configure our named logger directly.
logger = logging.getLogger("morning_routine")
logger.setLevel(logging.INFO)
if not logger.handlers:
    _handler = logging.StreamHandler()
    _handler.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(name)s %(message)s"))
    logger.addHandler(_handler)

settings = get_settings()
logger.info(
    "App initializing: environment=%s, cors_origins=%s, cors_regex=%s",
    settings.environment,
    settings.get_cors_origins_list(),
    settings.cors_origin_regex,
)

# ---------------------------------------------------------------------------
# FastAPI application
# ---------------------------------------------------------------------------
# Disable interactive docs in production to reduce attack surface and memory.
_docs_url = "/docs" if settings.environment != "production" else None
_redoc_url = "/redoc" if settings.environment != "production" else None

app = FastAPI(
    title=settings.app_name,
    description="API for tracking morning routines and productivity",
    version="0.1.0",
    docs_url=_docs_url,
    redoc_url=_redoc_url,
)

# ---------------------------------------------------------------------------
# CORS middleware
# ---------------------------------------------------------------------------
# CORS is handled entirely here (not in API Gateway) because HTTP API V2
# does not support wildcard subdomains in AllowOrigins.
# allow_origin_regex covers Vercel preview deploys (e.g. *.vercel.app).
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_cors_origins_list(),
    allow_origin_regex=settings.cors_origin_regex or None,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router)


# ---------------------------------------------------------------------------
# Request logging middleware - logs every request for CloudWatch observability
# ---------------------------------------------------------------------------
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log incoming requests and their responses for debugging and monitoring.

    Emits structured log lines visible in CloudWatch, including:
    - HTTP method and path
    - Origin header (helpful for CORS debugging)
    - Response status code and latency
    """
    start = time.monotonic()
    origin = request.headers.get("origin", "-")
    logger.info(
        "REQ %s %s origin=%s",
        request.method,
        request.url.path,
        origin,
    )

    response = await call_next(request)

    duration_ms = (time.monotonic() - start) * 1000
    logger.info(
        "RES %s %s status=%d duration=%.1fms",
        request.method,
        request.url.path,
        response.status_code,
        duration_ms,
    )
    return response


# ---------------------------------------------------------------------------
# Global exception handler
# ---------------------------------------------------------------------------
@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    """Return a clean JSON response for unexpected errors.

    Without this, unhandled exceptions may produce an HTML 500 page
    which confuses API consumers and clutters CloudWatch logs.
    """
    logger.error(
        "Unhandled exception on %s %s: %s", request.method, request.url.path, exc, exc_info=True
    )
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )


@app.get("/")
async def root():
    """Root endpoint - health check."""
    return {
        "message": "Morning Routine Productivity API",
        "version": "0.1.0",
        "docs": _docs_url,
    }


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy"}


# ---------------------------------------------------------------------------
# AWS Lambda handler
# ---------------------------------------------------------------------------
# lifespan="off" because ASGI startup/shutdown events are not reliably
# supported in the Lambda execution model (no persistent process).
# api_gateway_base_path strips the stage prefix (e.g. /development) from
# the request path so FastAPI routes match correctly.
handler = Mangum(
    app,
    lifespan="off",
    api_gateway_base_path=f"/{settings.environment}",
)
