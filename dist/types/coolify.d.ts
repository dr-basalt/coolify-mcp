export interface CoolifyConfig {
    baseUrl: string;
    accessToken: string;
}
export interface ServerInfo {
    id: string;
    name: string;
    status: 'running' | 'stopped' | 'error';
    version: string;
    resources: {
        cpu: number;
        memory: number;
        disk: number;
    };
}
export interface ErrorResponse {
    error: string;
    status: number;
    message: string;
}
