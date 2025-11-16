# ---------- Synq Dashboard: Local Dev Build ----------
    FROM node:18-bullseye

    # Install build dependencies (required for native npm packages)
    RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*
    
    # Set working directory
    WORKDIR /app
    
    # Copy package files
    COPY package*.json ./
    
    # Install dependencies
    RUN npm install
    
    # Copy rest of the project
    COPY . .
    
    # Expose Vite port
    EXPOSE 80
    
    # Default command for local development
    CMD ["nginx", "-g", "daemon off;"]
    