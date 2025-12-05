# ---------- Synq Dashboard: Production Build ----------
    FROM node:18-bullseye AS build

    WORKDIR /app
    
    RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*
    
    COPY package*.json ./
    RUN npm install
    
    COPY . .
    COPY .env /app/.env
    RUN npm run build
    
    # ---------- NGINX Stage ----------
    FROM nginx:alpine
    
    COPY --from=build /app/dist /usr/share/nginx/html
    
    EXPOSE 80
    
    CMD ["nginx", "-g", "daemon off;"]
    