import {
  DanubeError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ValidationError,
  RateLimitError,
  ConfigurationRequiredError,
  DanubeConnectionError,
  DanubeTimeoutError,
} from './errors.js';

interface RequestOptions {
  method: string;
  path: string;
  params?: Record<string, unknown>;
  body?: unknown;
  retryCount?: number;
  includeAuth?: boolean;
}

export class HTTPClient {
  private baseUrl: string;
  private apiKey: string;
  private timeout: number;
  private maxRetries: number;
  private activeController?: AbortController;

  constructor(options: {
    baseUrl: string;
    apiKey: string;
    timeout?: number;
    maxRetries?: number;
  }) {
    this.baseUrl = options.baseUrl.replace(/\/+$/, '');
    this.apiKey = options.apiKey;
    this.timeout = (options.timeout ?? 30) * 1000;
    this.maxRetries = options.maxRetries ?? 3;
  }

  async get<T>(path: string, params?: Record<string, unknown>): Promise<T> {
    return this.request<T>({ method: 'GET', path, params });
  }

  async post<T>(path: string, body?: unknown, params?: Record<string, unknown>): Promise<T> {
    return this.request<T>({ method: 'POST', path, body, params });
  }

  async put<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>({ method: 'PUT', path, body });
  }

  async patch<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>({ method: 'PATCH', path, body });
  }

  async delete<T>(path: string): Promise<T> {
    return this.request<T>({ method: 'DELETE', path });
  }

  async publicPost<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>({ method: 'POST', path, body, includeAuth: false });
  }

  close(): void {
    this.activeController?.abort();
  }

  private async request<T>(options: RequestOptions): Promise<T> {
    const { method, path, params, body, includeAuth = true } = options;
    const retryCount = options.retryCount ?? 0;

    const url = new URL(this.baseUrl + path);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value != null) {
          url.searchParams.set(key, String(value));
        }
      }
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'danube-ts/0.1.0',
    };
    if (includeAuth) {
      headers['danube-api-key'] = this.apiKey;
    }

    const controller = new AbortController();
    this.activeController = controller;
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url.toString(), {
        method,
        headers,
        body: body != null ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return await this.handleResponse<T>(response, retryCount, options);
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof DanubeError) {
        throw error;
      }

      if (error instanceof DOMException && error.name === 'AbortError') {
        if (retryCount < this.maxRetries) {
          await this.backoff(retryCount);
          return this.request<T>({ ...options, retryCount: retryCount + 1 });
        }
        throw new DanubeTimeoutError();
      }

      if (error instanceof TypeError) {
        // Network errors from fetch
        if (retryCount < this.maxRetries) {
          await this.backoff(retryCount);
          return this.request<T>({ ...options, retryCount: retryCount + 1 });
        }
        throw new DanubeConnectionError();
      }

      throw new DanubeError(
        error instanceof Error ? error.message : 'Unknown error occurred'
      );
    } finally {
      this.activeController = undefined;
    }
  }

  private async handleResponse<T>(
    response: Response,
    retryCount: number,
    options: RequestOptions
  ): Promise<T> {
    if (response.ok) {
      try {
        return (await response.json()) as T;
      } catch {
        return {} as T;
      }
    }

    // Retry on server errors and rate limits
    if (
      (response.status === 429 || (response.status >= 502 && response.status <= 504)) &&
      retryCount < this.maxRetries
    ) {
      await this.backoff(retryCount);
      return this.request<T>({ ...options, retryCount: retryCount + 1 });
    }

    // Parse error body
    let errorMessage: string | undefined;
    let errorDetails: Record<string, unknown> | undefined;
    try {
      const errorBody = await response.json();
      if (errorBody?.error?.message) {
        errorMessage = errorBody.error.message;
        errorDetails = errorBody.error.details;
      } else if (errorBody?.detail) {
        errorMessage = typeof errorBody.detail === 'string'
          ? errorBody.detail
          : JSON.stringify(errorBody.detail);
      } else if (errorBody?.message) {
        errorMessage = errorBody.message;
      }
    } catch {
      errorMessage = response.statusText;
    }

    switch (response.status) {
      case 400:
        throw new ValidationError(errorMessage);
      case 401:
        throw new AuthenticationError(errorMessage);
      case 403: {
        if (errorDetails && 'service_id' in errorDetails) {
          throw new ConfigurationRequiredError(
            errorMessage ?? 'Configuration required',
            String(errorDetails.service_id),
            String(errorDetails.service_name ?? '')
          );
        }
        throw new AuthorizationError(errorMessage);
      }
      case 404:
        throw new NotFoundError('Resource', options.path, errorMessage);
      case 429: {
        const retryAfter = response.headers.get('Retry-After');
        throw new RateLimitError(
          errorMessage,
          retryAfter ? parseInt(retryAfter, 10) : undefined
        );
      }
      default:
        throw new DanubeError(
          errorMessage ?? `Request failed with status ${response.status}`,
          response.status
        );
    }
  }

  private async backoff(retryCount: number): Promise<void> {
    const delay = Math.min(Math.pow(2, retryCount), 30) * 1000;
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
}
