# Use official Node.js LTS image as base
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy app source
COPY . .

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S express-user -u 1001

# Change ownership to non-root user
RUN chown -R express-user:nodejs /usr/src/app
USER express-user

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if(r.statusCode === 200) process.exit(0); process.exit(1)});"

# Start the application
CMD ["node", "server.js"]