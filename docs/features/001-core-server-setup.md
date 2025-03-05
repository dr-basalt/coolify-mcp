# ADR 001: Core Server Setup

## Context
Need basic MCP server implementation that can authenticate with Coolify and handle basic operations.

## Implementation Checklist
- [ ] Project structure setup
  - [ ] TypeScript configuration
  - [ ] ESLint + Prettier
  - [ ] Jest/Vitest setup
  - [ ] Basic GitHub Actions CI

- [ ] Core MCP Server
  - [ ] Basic server class implementation
  - [ ] Environment configuration (COOLIFY_ACCESS_TOKEN, COOLIFY_BASE_URL)
  - [ ] Coolify API client wrapper
  - [ ] Error handling structure

- [ ] Testing Infrastructure
  - [ ] Mock Coolify API responses
  - [ ] Basic integration test framework

## Dependencies
- None (This is our first implementation) 