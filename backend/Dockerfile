FROM node:20-slim

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . ./

EXPOSE 5000

CMD ["node", "src/server.js"]
