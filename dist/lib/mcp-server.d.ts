import { CoolifyConfig } from '../types/coolify.js';
export declare class CoolifyMcpServer {
    private server;
    private client;
    constructor(config: CoolifyConfig);
    private setupResources;
    start(transport: any): Promise<void>;
}
