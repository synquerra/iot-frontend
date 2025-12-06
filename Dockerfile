# ---------- Synq Dashboard: Production Build ----------
    FROM node:18-bullseye AS build

    WORKDIR /app
    
    RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*
    
    COPY package*.json ./
    RUN npm install
    
    # ✅ COPY .env before build
    COPY .env .env
    
    COPY . .
    
    RUN npm run build
    
    # ---------- NGINX Stage ----------
    FROM nginx:alpine
    
    COPY --from=build /app/dist /usr/share/nginx/html
    COPY nginx.conf /etc/nginx/conf.d/default.conf
    
    EXPOSE 80
    
    CMD ["nginx", "-g", "daemon off;"]
    