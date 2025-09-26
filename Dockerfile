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
# --ignore-scripts évite l'exécution du script "prepare" qui fait appel à husky
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

# Copie du build depuis l'étape précédente
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

# Créer un utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs && \
    adduser -S mcp -u 1001 -G nodejs

# Changer la propriété des fichiers
RUN chown -R mcp:nodejs /app
USER mcp

# Exposition du port
EXPOSE 3000

# Variables d'environnement par défaut
ENV NODE_ENV=production
ENV PORT=3000

# Démarrage de l'application
CMD ["npm", "start"]
