"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoolifyMcpServer = void 0;
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const coolify_client_js_1 = require("./coolify-client.js");
class CoolifyMcpServer {
    constructor(config) {
        this.server = new mcp_js_1.McpServer({
            name: 'Coolify MCP',
            version: '0.1.0',
        });
        this.client = new coolify_client_js_1.CoolifyClient(config);
        this.setupResources();
    }
    setupResources() {
        // Server info resource
        this.server.resource('server-info', 'coolify://server/info', async () => {
            const info = await this.client.getServerInfo();
            return {
                contents: [
                    {
                        uri: 'coolify://server/info',
                        text: JSON.stringify(info, null, 2),
                    },
                ],
            };
        });
        // More resources will be added here
    }
    async start(transport) {
        await this.server.connect(transport);
    }
}
exports.CoolifyMcpServer = CoolifyMcpServer;
