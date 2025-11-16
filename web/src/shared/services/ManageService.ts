import { HTTP_METHODS, CONTENT_TYPES } from './apiConstants';

type HttpMethod = typeof HTTP_METHODS[keyof typeof HTTP_METHODS];

interface RequestConfig {
  endpoint: string;
  method: HttpMethod;
  queryParams?: Record<string, string | number | boolean>;
  body?: unknown;
  headers?: Record<string, string>;
}

class RequestBuilder {
  private config: RequestConfig;
  private baseUrl: string;

  constructor(endpoint: string, method: HttpMethod, baseUrl: string) {
    this.config = {
      endpoint,
      method,
      headers: {
        'Content-Type': CONTENT_TYPES.JSON,
      },
    };
    this.baseUrl = baseUrl;
  }

  setQueryParams(params: Record<string, string | number | boolean>): this {
    this.config.queryParams = params;

    return this;
  }

  setBody(body: unknown): this {
    this.config.body = body;

    return this;
  }

  setHeaders(headers: Record<string, string>): this {
    this.config.headers = {
      ...this.config.headers,
      ...headers,
    };

    return this;
  }

  async execRequest<T>(): Promise<T> {
    try {
      // Build URL with query params
      let url = `${this.baseUrl}${this.config.endpoint}`;

      if (this.config.queryParams) {
        const params = new URLSearchParams();
        Object.entries(this.config.queryParams).forEach(([key, value]) => {
          params.append(key, String(value));
        });
        url += `?${params.toString()}`;
      }

      // Build request options
      const options: RequestInit = {
        method: this.config.method,
        headers: this.config.headers,
      };

      // Add body for non-GET requests
      if (this.config.body && this.config.method !== HTTP_METHODS.GET) {
        options.body = JSON.stringify(this.config.body);
      }

      // Execute request
      const response = await fetch(url, options);

      // Handle errors
      if (!response.ok) {
        const errorMessage = await response.text();

        throw new Error(
          `HTTP ${response.status}: ${errorMessage || response.statusText}`
        );
      }

      // Parse response
      if (response.status === 204) {
        return undefined as T;
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      // Re-throw with better error message
      if (error instanceof Error) {
        throw error;
      }

      throw new Error('An unexpected error occurred');
    }
  }
}

export function ManageService(baseUrl: string) {

  return {
    prepareRequest: (endpoint: string, method: HttpMethod) => {
      return new RequestBuilder(endpoint, method, baseUrl);
    },
  };
}

