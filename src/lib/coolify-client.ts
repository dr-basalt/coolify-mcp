import { CoolifyConfig, ErrorResponse, ServerInfo, ServerStatus, ServerDomain, ValidationResponse } from '../types/coolify.js';

export class CoolifyClient {
  private baseUrl: string;
  private accessToken: string;

  constructor(config: CoolifyConfig) {
    if (!config.baseUrl) {
      throw new Error('Coolify base URL is required');
    }
    if (!config.accessToken) {
      throw new Error('Coolify access token is required');
    }
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.accessToken = config.accessToken;
  }

  private async request<T>(path: string): Promise<T> {
    try {
      const url = `${this.baseUrl}/api/v1${path}`;
      console.error(`Making request to: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.accessToken}`,
        },
      });

      console.error(`Response status: ${response.status}`);
      const data = await response.json();
      console.error('Response data:', JSON.stringify(data, null, 2));

      if (!response.ok) {
        const error = data as ErrorResponse;
        throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return data as T;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error(`Failed to connect to Coolify server at ${this.baseUrl}. Please check if the server is running and the URL is correct.`);
      }
      console.error('Request error:', error);
      throw error;
    }
  }

  async listServers(): Promise<ServerInfo[]> {
    console.error('Listing all servers...');
    return this.request<ServerInfo[]>('/servers');
  }

  async getServer(uuid: string): Promise<ServerInfo> {
    console.error(`Getting server info for UUID: ${uuid}`);
    return this.request<ServerInfo>(`/servers/${uuid}`);
  }

  async getServerStatus(uuid: string): Promise<ServerStatus> {
    console.log(`Getting server status for UUID: ${uuid}`);
    return this.request<ServerStatus>(`/servers/${uuid}/resources`);
  }

  async getServerDomains(uuid: string): Promise<ServerDomain[]> {
    console.log(`Getting server domains for UUID: ${uuid}`);
    return this.request<ServerDomain[]>(`/servers/${uuid}/domains`);
  }

  async validateServer(uuid: string): Promise<ValidationResponse> {
    console.log(`Validating server with UUID: ${uuid}`);
    return this.request<ValidationResponse>(`/servers/${uuid}/validate`);
  }

  async validateConnection(): Promise<void> {
    try {
      await this.listServers();
    } catch (error) {
      throw new Error(`Failed to connect to Coolify server: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Add more methods as needed for other endpoints
}
