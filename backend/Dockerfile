FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
# Install build tools for native dependencies (like bcrypt)
RUN apk add --no-cache python3 make g++
RUN npm ci --only=production

# Copy source
COPY src/ ./src/
COPY .env.example ./.env.example

EXPOSE 5000

CMD ["node", "src/server.js"]
