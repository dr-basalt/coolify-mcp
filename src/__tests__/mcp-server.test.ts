import { CoolifyMcpServer } from '../lib/mcp-server.js';
import { jest } from '@jest/globals';

describe('CoolifyMcpServer', () => {
  const mockConfig = {
    baseUrl: 'https://coolify.test',
    accessToken: 'test-token',
  };

  let server: CoolifyMcpServer;

  beforeEach(() => {
    server = new CoolifyMcpServer(mockConfig);
  });

  describe('get_server_resources', () => {
    it('should call client getServerResources', async () => {
      const spy = jest.spyOn(server['client'], 'getServerResources');
      await server.get_server_resources('test-uuid');
      expect(spy).toHaveBeenCalledWith('test-uuid');
    });
  });

  describe('validate_server', () => {
    it('should call client validateServer', async () => {
      const spy = jest.spyOn(server['client'], 'validateServer');
      await server.validate_server('test-uuid');
      expect(spy).toHaveBeenCalledWith('test-uuid');
    });
  });
});
