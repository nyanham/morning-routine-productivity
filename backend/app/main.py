import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from mangum import Mangum

from app.api import api_router
from app.core.config import get_settings


# ---------------------------------------------------------------------------
# Structured logging - outputs to CloudWatch in Lambda
# ---------------------------------------------------------------------------
logger = logging.getLogger("morning_routine")
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)

settings = get_settings()

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
    allow_origins=settings.cors_origins,
    allow_origin_regex=settings.cors_origin_regex or None,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router)


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
        "docs": "/docs",
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
handler = Mangum(app, lifespan="off")
