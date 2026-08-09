FROM node:20-alpine AS builder

WORKDIR /app

# Build Frontend
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install --legacy-peer-deps

COPY frontend/ ./frontend/
RUN cd frontend && npm run build

# Setup Backend
COPY backend/package*.json ./backend/
RUN cd backend && npm install --legacy-peer-deps

COPY backend/ ./backend/

# Expose Port
EXPOSE 5000

ENV NODE_ENV=production
ENV PORT=5000

CMD ["node", "backend/server.js"]
