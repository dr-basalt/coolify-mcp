"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const coolify_client_js_1 = require("../lib/coolify-client.js");
// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;
describe('CoolifyClient', () => {
    let client;
    const mockConfig = {
        baseUrl: 'http://test.coolify.io',
        accessToken: 'test-token',
    };
    beforeEach(() => {
        client = new coolify_client_js_1.CoolifyClient(mockConfig);
        mockFetch.mockClear();
    });
    describe('getServerInfo', () => {
        const mockServerInfo = {
            id: 'test-id',
            name: 'test-server',
            status: 'running',
            version: '1.0.0',
            resources: {
                cpu: 2,
                memory: 4096,
                disk: 50,
            },
        };
        it('should fetch server info successfully', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockServerInfo,
            });
            const result = await client.getServerInfo();
            expect(result).toEqual(mockServerInfo);
            expect(mockFetch).toHaveBeenCalledWith('http://test.coolify.io/api/v1/server', expect.objectContaining({
                headers: expect.objectContaining({
                    Authorization: 'Bearer test-token',
                    'Content-Type': 'application/json',
                }),
            }));
        });
        it('should handle error responses', async () => {
            const errorResponse = {
                error: 'Unauthorized',
                status: 401,
                message: 'Invalid token',
            };
            mockFetch.mockResolvedValueOnce({
                ok: false,
                json: async () => errorResponse,
            });
            await expect(client.getServerInfo()).rejects.toThrow('Invalid token');
        });
    });
});
