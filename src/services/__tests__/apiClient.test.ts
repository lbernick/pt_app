import { ApiClient } from '../apiClient';
import { config } from '../../config/env';

jest.mock('../../config/env', () => ({
  config: {
    authToken: undefined,
  },
}));

describe('ApiClient', () => {
  const testUrl = 'http://localhost:8000/api/v1/test';

  beforeEach(() => {
    global.fetch = jest.fn();
    (config as { authToken?: string }).authToken = undefined;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('fetch', () => {
    it('should make a GET request with default headers', async () => {
      const mockResponse = new Response();
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      await ApiClient.fetch(testUrl);

      expect(global.fetch).toHaveBeenCalledWith(testUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    it('should include Authorization header when authToken is set', async () => {
      (config as { authToken?: string }).authToken = 'test-token-123';
      const mockResponse = new Response();
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      await ApiClient.fetch(testUrl);

      expect(global.fetch).toHaveBeenCalledWith(testUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token-123',
        },
      });
    });

    it('should not include Authorization header when authToken is undefined', async () => {
      const mockResponse = new Response();
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      await ApiClient.fetch(testUrl);

      expect(global.fetch).toHaveBeenCalledWith(testUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    it('should make a POST request with body', async () => {
      (config as { authToken?: string }).authToken = 'test-token-123';
      const mockResponse = new Response();
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);
      const requestBody = { key: 'value' };

      await ApiClient.fetch(testUrl, {
        method: 'POST',
        body: requestBody,
      });

      expect(global.fetch).toHaveBeenCalledWith(testUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token-123',
        },
        body: JSON.stringify(requestBody),
      });
    });

    it('should allow custom headers to override default headers', async () => {
      const mockResponse = new Response();
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      await ApiClient.fetch(testUrl, {
        headers: { 'Custom-Header': 'custom-value' },
      });

      expect(global.fetch).toHaveBeenCalledWith(testUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Custom-Header': 'custom-value',
        },
      });
    });
  });

  describe('fetchJson', () => {
    it('should return parsed JSON on successful response', async () => {
      const mockData = { id: 1, name: 'Test' };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await ApiClient.fetchJson(testUrl);

      expect(result).toEqual(mockData);
    });

    it('should include Authorization header when authToken is set', async () => {
      (config as { authToken?: string }).authToken = 'test-token-123';
      const mockData = { id: 1 };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      await ApiClient.fetchJson(testUrl);

      expect(global.fetch).toHaveBeenCalledWith(testUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token-123',
        },
      });
    });

    it('should throw an error when response is not ok', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      });

      await expect(ApiClient.fetchJson(testUrl)).rejects.toThrow(
        'API request failed: 401 Unauthorized'
      );
    });

    it('should throw an error for 404 responses', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(ApiClient.fetchJson(testUrl)).rejects.toThrow(
        'API request failed: 404 Not Found'
      );
    });

    it('should throw an error for 500 responses', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(ApiClient.fetchJson(testUrl)).rejects.toThrow(
        'API request failed: 500 Internal Server Error'
      );
    });

    it('should handle POST requests with Authorization header', async () => {
      (config as { authToken?: string }).authToken = 'secure-token';
      const mockData = { success: true };
      const requestBody = { data: 'test' };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await ApiClient.fetchJson(testUrl, {
        method: 'POST',
        body: requestBody,
      });

      expect(global.fetch).toHaveBeenCalledWith(testUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer secure-token',
        },
        body: JSON.stringify(requestBody),
      });
      expect(result).toEqual(mockData);
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      await expect(ApiClient.fetchJson(testUrl)).rejects.toThrow('Network error');
    });
  });
});
