"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const mcp_server_js_1 = require("./lib/mcp-server.js");
async function main() {
    const config = {
        baseUrl: process.env.COOLIFY_BASE_URL || 'http://localhost:3000',
        accessToken: process.env.COOLIFY_ACCESS_TOKEN || '',
    };
    if (!config.accessToken) {
        throw new Error('COOLIFY_ACCESS_TOKEN environment variable is required');
    }
    const server = new mcp_server_js_1.CoolifyMcpServer(config);
    const transport = new stdio_js_1.StdioServerTransport();
    await server.start(transport);
}
main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
