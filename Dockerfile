FROM node:18-alpine AS builder

# Installation des dépendances de build
WORKDIR /app
COPY package*.json ./
RUN npm ci --include=dev

# Build de l'application
COPY . .
RUN npm run build

# Image de production
FROM node:18-alpine AS production

WORKDIR /app

# Installation des dépendances de production uniquement
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copie du build depuis l'étape précédente
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

# Utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs
RUN adduser -S mcp -u 1001
USER mcp

# Exposition du port
EXPOSE 3000

# Démarrage de l'application
CMD ["npm", "start"]
