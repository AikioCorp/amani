# ==========================================
# Étape 1 : Build du Frontend (Vite SPA)
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copier les fichiers de dépendances
COPY package.json pnpm-lock.yaml* package-lock.json* ./

# Installer pnpm et les dépendances sans blocage de scripts
RUN if [ -f pnpm-lock.yaml ]; then corepack enable && pnpm i --ignore-scripts; \
    else npm install --ignore-scripts; fi

# Copier le reste du code source
COPY . .

# Définir l'URL de l'API pour le build Vite
ARG VITE_API_URL=/api
ENV VITE_API_URL=${VITE_API_URL}

# Exécuter le build de production Vite
RUN if [ -f pnpm-lock.yaml ]; then corepack enable && pnpm run build; \
    else npm run build; fi

# ==========================================
# Étape 2 : Image de Production Nginx Statique
# ==========================================
FROM nginx:1.25-alpine AS runner

# Copier la configuration Nginx sur mesure
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copier les fichiers statiques compilés depuis l'étape de build
COPY --from=builder /app/dist/spa /usr/share/nginx/html

# Exposer le port 80 pour le trafic HTTP
EXPOSE 80

# Démarrer Nginx en arrière-plan principal
CMD ["nginx", "-g", "daemon off;"]
