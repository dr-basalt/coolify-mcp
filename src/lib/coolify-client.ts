import { CoolifyConfig, ErrorResponse, ServerInfo } from '../types/coolify.js';

export class CoolifyClient {
  private baseUrl: string;
  private accessToken: string;

  constructor(config: CoolifyConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.accessToken = config.accessToken;
  }

  private async request<T>(
    path: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseUrl}/api/v1${path}`;
    const headers = {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      const error: ErrorResponse = await response.json();
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getServerInfo(): Promise<ServerInfo> {
    return this.request<ServerInfo>('/server');
  }

  // Add more methods as needed for other endpoints
} 