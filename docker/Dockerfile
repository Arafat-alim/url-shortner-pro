# Use official Node.js image
FROM node:22-alpine3.20

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy all files to the container
COPY . .

# Expose the port
EXPOSE 3000

# Command to run the app
CMD ["node", "app.js"]
