# ./spy-grocery-frontend-v2/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copie des dépendances en premier pour optimiser le cache
COPY package*.json ./

# Installation des dépendances (y compris devDependencies)
RUN npm install

# Copie du code source
COPY . .

# Commande de développement avec hot-reload
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]  # Force l'écoute sur toutes les interfaces
