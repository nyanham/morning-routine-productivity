/**
 * Tests for API client utilities.
 */

import { ApiError, apiClient } from '@/lib/api';

// Mock fetch globally
global.fetch = jest.fn();

const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('ApiError', () => {
  it('creates error with status and detail', () => {
    const error = new ApiError(404, 'Not found');

    expect(error.status).toBe(404);
    expect(error.detail).toBe('Not found');
    expect(error.message).toBe('Not found');
    expect(error.name).toBe('ApiError');
  });

  it('is an instance of Error', () => {
    const error = new ApiError(500, 'Server error');

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ApiError);
  });
});

describe('apiClient', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('makes GET request by default', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ data: 'test' }),
    } as Response);

    await apiClient('/test');

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/test'),
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      })
    );
  });

  it('includes authorization header when token provided', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    } as Response);

    await apiClient('/test', { token: 'my-token' });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer my-token',
        }),
      })
    );
  });

  it('sends JSON body for POST requests', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({ id: 'new-id' }),
    } as Response);

    await apiClient('/test', {
      method: 'POST',
      body: { name: 'test' },
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ name: 'test' }),
      })
    );
  });

  it('returns parsed JSON response', async () => {
    const responseData = { id: '123', name: 'Test' };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => responseData,
    } as Response);

    const result = await apiClient<typeof responseData>('/test');

    expect(result).toEqual(responseData);
  });

  it('handles 204 No Content response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 204,
      json: async () => null,
    } as Response);

    const result = await apiClient('/test', { method: 'DELETE' });

    expect(result).toBeUndefined();
  });

  it('throws ApiError on non-ok response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ detail: 'Not found' }),
    } as Response);

    await expect(apiClient('/test')).rejects.toThrow(ApiError);

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ detail: 'Not found' }),
    } as Response);

    await expect(apiClient('/test')).rejects.toMatchObject({
      status: 404,
      detail: 'Not found',
    });
  });

  it('handles error response without detail', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({}),
    } as Response);

    await expect(apiClient('/test')).rejects.toMatchObject({
      status: 500,
      detail: 'API request failed',
    });
  });

  it('handles JSON parse error on error response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => {
        throw new Error('Invalid JSON');
      },
    } as Response);

    await expect(apiClient('/test')).rejects.toMatchObject({
      status: 500,
      detail: 'API request failed',
    });
  });

  it('supports PUT method', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ updated: true }),
    } as Response);

    await apiClient('/test', {
      method: 'PUT',
      body: { name: 'updated' },
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ method: 'PUT' })
    );
  });

  it('supports DELETE method', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 204,
    } as Response);

    await apiClient('/test', { method: 'DELETE' });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ method: 'DELETE' })
    );
  });

  it('supports PATCH method', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ patched: true }),
    } as Response);

    await apiClient('/test', {
      method: 'PATCH',
      body: { field: 'value' },
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ method: 'PATCH' })
    );
  });

  it('allows custom headers', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    } as Response);

    await apiClient('/test', {
      headers: { 'X-Custom-Header': 'value' },
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          'X-Custom-Header': 'value',
          'Content-Type': 'application/json',
        }),
      })
    );
  });
});
