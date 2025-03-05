import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { Transport } from '@modelcontextprotocol/sdk/shared/transport.js';
import { CoolifyClient } from './coolify-client.js';
import { CoolifyConfig } from '../types/coolify.js';
import { z } from 'zod';

export class CoolifyMcpServer {
  private server: McpServer;
  private client: CoolifyClient;

  constructor(config: CoolifyConfig) {
    this.server = new McpServer({
      name: 'coolify',
      version: '0.1.0',
    });

    this.client = new CoolifyClient(config);
    this.setupTools();
  }

  private setupTools(): void {
    this.server.tool(
      'list_servers',
      'Get a list of all Coolify servers',
      async () => {
        try {
          const servers = await this.client.listServers();
          return {
            content: [{ type: 'text', text: JSON.stringify(servers) }],
            isError: false
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          return {
            content: [{ type: 'text', text: errorMessage }],
            isError: true
          };
        }
      }
    );

    this.server.tool(
      'get_server',
      'Get information about a specific Coolify server',
      { uuid: z.string().describe('UUID of the server to get information for') },
      async (params) => {
        try {
          const server = await this.client.getServer(params.uuid);
          return {
            content: [{ type: 'text', text: JSON.stringify(server) }],
            isError: false
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          return {
            content: [{ type: 'text', text: errorMessage }],
            isError: true
          };
        }
      }
    );

    this.server.tool(
      'get_server_status',
      'Get the current health status and resource utilization of a specific Coolify server',
      { uuid: z.string().describe('UUID of the server to get status for') },
      async (params) => {
        try {
          const status = await this.client.getServerStatus(params.uuid);
          return {
            content: [{ type: 'text', text: JSON.stringify(status) }],
            isError: false
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          return {
            content: [{ type: 'text', text: errorMessage }],
            isError: true
          };
        }
      }
    );
  }

  async start(transport: Transport): Promise<void> {
    try {
      await this.client.validateConnection();
      await this.server.connect(transport);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to start MCP server: ${errorMessage}`);
    }
  }
}
