import { createServer, IncomingMessage, ServerResponse } from 'http';
import { URL } from 'url';

interface CoolifyConfig {
  baseUrl: string;
  token: string;
}

class CoolifyHTTPAPI {
  private config: CoolifyConfig;

  constructor() {
    this.config = {
      baseUrl: process.env.COOLIFY_BASE_URL || '',
      token: process.env.COOLIFY_ACCESS_TOKEN || ''
    };

    if (!this.config.baseUrl || !this.config.token) {
      console.error('❌ Missing required environment variables: COOLIFY_BASE_URL, COOLIFY_ACCESS_TOKEN');
      process.exit(1);
    }
  }

  private async makeRequest(endpoint: string, method: string = 'GET', body?: any): Promise<any> {
    const url = `${this.config.baseUrl.replace(/\/$/, '')}/api/v1${endpoint}`;
    
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${this.config.token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: body ? JSON.stringify(body) : undefined
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Coolify API Error [${method} ${endpoint}]:`, error);
      throw error;
    }
  }

  // API Methods for n8n
  async getServers() {
    return await this.makeRequest('/servers');
  }

  async getProjects() {
    return await this.makeRequest('/projects');
  }

  async getApplications() {
    return await this.makeRequest('/applications');
  }

  async getServices() {
    return await this.makeRequest('/services');
  }

  async getDatabases() {
    return await this.makeRequest('/databases');
  }

  async getDeployments() {
    return await this.makeRequest('/deployments');
  }

  async getApplication(uuid: string) {
    return await this.makeRequest(`/applications/${uuid}`);
  }

  async startApplication(uuid: string) {
    return await this.makeRequest(`/applications/${uuid}/start`, 'POST');
  }

  async stopApplication(uuid: string) {
    return await this.makeRequest(`/applications/${uuid}/stop`, 'POST');
  }

  async restartApplication(uuid: string) {
    return await this.makeRequest(`/applications/${uuid}/restart`, 'POST');
  }

  async deployApplication(uuid: string) {
    return await this.makeRequest(`/applications/${uuid}/deploy`, 'POST');
  }

  async createProject(name: string, description: string = '') {
    return await this.makeRequest('/projects', 'POST', { name, description });
  }

  async deleteProject(uuid: string) {
    return await this.makeRequest(`/projects/${uuid}`, 'DELETE');
  }

  async healthCheck() {
    try {
      // Test de base - tentative de récupération des projets
      await this.makeRequest('/projects');
      return { 
        status: 'healthy', 
        coolify: { connected: true, baseUrl: this.config.baseUrl }
      };
    } catch (error) {
      return { 
        status: 'unhealthy', 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

class HTTPServer {
  private coolify: CoolifyHTTPAPI;
  private port: number;

  constructor() {
    this.coolify = new CoolifyHTTPAPI();
    this.port = parseInt(process.env.PORT || '3000');
  }

  private setCORSHeaders(res: ServerResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Content-Type', 'application/json');
  }

  private async getBody(req: IncomingMessage): Promise<any> {
    return new Promise((resolve) => {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        try {
          resolve(body ? JSON.parse(body) : {});
        } catch {
          resolve({});
        }
      });
    });
  }

  private sendResponse(res: ServerResponse, data: any, statusCode: number = 200) {
    res.writeHead(statusCode);
    res.end(JSON.stringify({
      success: statusCode < 400,
      data,
      timestamp: new Date().toISOString()
    }));
  }

  private sendError(res: ServerResponse, error: string, statusCode: number = 500) {
    res.writeHead(statusCode);
    res.end(JSON.stringify({
      success: false,
      error,
      timestamp: new Date().toISOString()
    }));
  }

  private async handleRequest(req: IncomingMessage, res: ServerResponse) {
    this.setCORSHeaders(res);

    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    const url = new URL(req.url!, `http://${req.headers.host}`);
    const path = url.pathname;
    const method = req.method!;

    console.log(`${new Date().toISOString()} - ${method} ${path}`);

    try {
      const body = ['POST', 'PUT'].includes(method) ? await this.getBody(req) : {};
      let result: any;

      // Router
      switch (path) {
        case '/':
          result = {
            message: 'Coolify HTTP API for n8n',
            version: '1.0.0',
            endpoints: {
              'GET /health': 'Check API health',
              'GET /servers': 'List all servers',
              'GET /projects': 'List all projects',
              'GET /applications': 'List all applications',
              'GET /services': 'List all services',
              'GET /databases': 'List all databases',
              'GET /deployments': 'List all deployments',
              'GET /applications/:uuid': 'Get application details',
              'POST /applications/:uuid/start': 'Start application',
              'POST /applications/:uuid/stop': 'Stop application',
              'POST /applications/:uuid/restart': 'Restart application',
              'POST /applications/:uuid/deploy': 'Deploy application',
              'POST /projects': 'Create project (body: {name, description})',
              'DELETE /projects/:uuid': 'Delete project'
            }
          };
          break;

        case '/health':
          result = await this.coolify.healthCheck();
          break;

        case '/servers':
          result = await this.coolify.getServers();
          break;

        case '/projects':
          if (method === 'GET') {
            result = await this.coolify.getProjects();
          } else if (method === 'POST') {
            result = await this.coolify.createProject(body.name, body.description);
          } else {
            this.sendError(res, 'Method not allowed', 405);
            return;
          }
          break;

        case '/applications':
          result = await this.coolify.getApplications();
          break;

        case '/services':
          result = await this.coolify.getServices();
          break;

        case '/databases':
          result = await this.coolify.getDatabases();
          break;

        case '/deployments':
          result = await this.coolify.getDeployments();
          break;

        default:
          // Routes avec paramètres UUID
          const applicationMatch = path.match(/^\/applications\/([^\/]+)$/);
          const applicationActionMatch = path.match(/^\/applications\/([^\/]+)\/(start|stop|restart|deploy)$/);
          const projectDeleteMatch = path.match(/^\/projects\/([^\/]+)$/);

          if (applicationActionMatch && method === 'POST') {
            const [, uuid, action] = applicationActionMatch;
            switch (action) {
              case 'start':
                result = await this.coolify.startApplication(uuid);
                break;
              case 'stop':
                result = await this.coolify.stopApplication(uuid);
                break;
              case 'restart':
                result = await this.coolify.restartApplication(uuid);
                break;
              case 'deploy':
                result = await this.coolify.deployApplication(uuid);
                break;
            }
          } else if (applicationMatch && method === 'GET') {
            const [, uuid] = applicationMatch;
            result = await this.coolify.getApplication(uuid);
          } else if (projectDeleteMatch && method === 'DELETE') {
            const [, uuid] = projectDeleteMatch;
            result = await this.coolify.deleteProject(uuid);
          } else {
            this.sendError(res, `Endpoint not found: ${path}`, 404);
            return;
          }
          break;
      }

      this.sendResponse(res, result);

    } catch (error) {
      console.error('Error processing request:', error);
      this.sendError(res, error instanceof Error ? error.message : 'Internal server error');
    }
  }

  start() {
    const server = createServer((req, res) => this.handleRequest(req, res));

    server.listen(this.port, '0.0.0.0', () => {
      console.log(`🚀 Coolify HTTP API running on port ${this.port}`);
      console.log(`📊 Health: http://localhost:${this.port}/health`);
      console.log(`📚 Docs: http://localhost:${this.port}/`);
      console.log(`🌐 Coolify: ${process.env.COOLIFY_BASE_URL}`);
      console.log(`🔑 Token: ${process.env.COOLIFY_ACCESS_TOKEN ? '✅ Configured' : '❌ Missing'}`);
      console.log('\n📋 Available endpoints for n8n:');
      console.log('  GET  /health - Check API health');
      console.log('  GET  /servers - List all servers');
      console.log('  GET  /projects - List all projects');
      console.log('  GET  /applications - List all applications');
      console.log('  GET  /services - List all services');
      console.log('  GET  /databases - List all databases');
      console.log('  GET  /deployments - List all deployments');
      console.log('  GET  /applications/:uuid - Get application details');
      console.log('  POST /applications/:uuid/start - Start application');
      console.log('  POST /applications/:uuid/stop - Stop application');
      console.log('  POST /applications/:uuid/restart - Restart application');
      console.log('  POST /applications/:uuid/deploy - Deploy application');
      console.log('  POST /projects - Create project (body: {name, description})');
      console.log('  DELETE /projects/:uuid - Delete project');
    });
  }
}

// Start the server
const httpServer = new HTTPServer();
httpServer.start();
