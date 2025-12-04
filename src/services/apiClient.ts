import { config } from '../config/env';

export interface ApiClientOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: unknown;
  headers?: Record<string, string>;
}

export class ApiClient {
  private static getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (config.authToken) {
      headers['Authorization'] = `Bearer ${config.authToken}`;
    }

    return headers;
  }

  static async fetch(url: string, options: ApiClientOptions = {}): Promise<Response> {
    const { method = 'GET', body, headers: customHeaders = {} } = options;

    const authHeaders = this.getAuthHeaders();
    const headers = { ...authHeaders, ...customHeaders };

    const fetchOptions: RequestInit = {
      method,
      headers,
    };

    if (body !== undefined) {
      fetchOptions.body = JSON.stringify(body);
    }

    return fetch(url, fetchOptions);
  }

  static async fetchJson<T>(url: string, options: ApiClientOptions = {}): Promise<T> {
    const response = await this.fetch(url, options);

    if (!response.ok) {
      throw new Error(
        `API request failed: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  }
}
