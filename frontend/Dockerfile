# Frontend Dockerfile
FROM node:20-alpine

WORKDIR /app

# Set npm registry to Taobao mirror for faster downloads in China
RUN npm config set registry https://registry.npmmirror.com

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Start development server
CMD ["npm", "run", "dev"]
