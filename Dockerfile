FROM node:18-alpine

WORKDIR /app

# Copie des fichiers
COPY package*.json ./
COPY . .

# Installation et build en une seule étape
RUN npm ci --ignore-scripts && \
    npm run build && \
    npm prune --omit=dev --ignore-scripts && \
    npm cache clean --force

# Utilisateur non-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S mcp -u 1001 -G nodejs && \
    chown -R mcp:nodejs /app

USER mcp

EXPOSE 3000
ENV NODE_ENV=production

CMD ["npm", "start"]
