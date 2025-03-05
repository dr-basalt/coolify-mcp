import { CoolifyConfig, ServerInfo } from '../types/coolify.js';
export declare class CoolifyClient {
    private baseUrl;
    private accessToken;
    constructor(config: CoolifyConfig);
    private request;
    getServerInfo(): Promise<ServerInfo>;
}
