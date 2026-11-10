FROM node:20-slim

WORKDIR /app

# Install build tools if needed
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy package definitions and install
COPY server/package*.json ./server/
RUN cd server && npm install --omit=dev

# Copy server source
COPY server/ ./server/

EXPOSE 5000

ENV PORT=5000
ENV NODE_ENV=production

CMD ["node", "server/src/index.js"]
