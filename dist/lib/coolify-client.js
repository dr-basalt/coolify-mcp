"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoolifyClient = void 0;
class CoolifyClient {
    constructor(config) {
        this.baseUrl = config.baseUrl.replace(/\/$/, '');
        this.accessToken = config.accessToken;
    }
    async request(path, options = {}) {
        const url = `${this.baseUrl}/api/v1${path}`;
        const headers = {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
            ...options.headers,
        };
        const response = await fetch(url, { ...options, headers });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || `HTTP error! status: ${response.status}`);
        }
        return response.json();
    }
    async getServerInfo() {
        return this.request('/server');
    }
}
exports.CoolifyClient = CoolifyClient;
