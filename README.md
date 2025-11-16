# Synq Dashboard (React + Vite + Tailwind)

This is a generated React frontend scaffold that follows a modern dashboard layout inspired by your Figma "Synq Dashboard".

### Run locally
1. Install dependencies
```bash
npm install
```

2. Start dev server
```bash
npm run dev
```

This project uses Vite + React + Tailwind CSS. The UI is intentionally scaffolded to match a dark dashboard look (sidebar, topbar, cards, pages). Replace placeholder data, add charts, and wire APIs as needed.

## Docker / Deployment

Build and run with Docker (multi-stage build, served by nginx):

```bash
# build image
docker build -t synq-dashboard:latest .

# run container
docker run -p 8080:80 synq-dashboard:latest

# or use docker-compose
docker-compose up --build -d
```

Open http://localhost:8080 to view the app.

Notes:
- The Dockerfile uses a multi-stage build (Node -> build -> nginx) to produce a small production image.
- nginx.conf includes SPA fallback (`try_files ... /index.html`) so client-side routing works.

## 🐳 Docker Setup (Dev + Prod)

### Development Mode (Hot Reload)
Runs Vite dev server with live reload and local volume mount.

```bash
docker-compose -f docker-compose.dev.yml up
```

Then open: http://localhost:5173

Changes in your code will reflect automatically.

### Production Mode (Optimized Build)
Builds app and serves via nginx.

```bash
docker-compose -f docker-compose.prod.yml up --build -d
```

Then open: http://localhost:8080

### Notes
- `.dockerignore` keeps your build small.
- Dev mode mounts code for instant reload.
- Prod mode uses the multi-stage Dockerfile for a minimal production image.
