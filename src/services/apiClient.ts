export interface ApiClientOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: unknown;
  headers?: Record<string, string>;
  token?: string;
}

export class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ApiClient {
  private static getAuthHeaders(token?: string): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  static async fetch(url: string, options: ApiClientOptions = {}): Promise<Response> {
    const { method = 'GET', body, headers: customHeaders = {}, token } = options;

    const authHeaders = this.getAuthHeaders(token);
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
      if (response.status === 401) {
        throw new UnauthorizedError(
          `Unauthorized: ${response.status} ${response.statusText}`
        );
      }
      throw new Error(
        `API request failed: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  }
}
