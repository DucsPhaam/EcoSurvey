FROM node:20-slim

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY src/ ./src/
COPY .env.example ./.env.example

EXPOSE 5000

CMD ["node", "src/server.js"]
