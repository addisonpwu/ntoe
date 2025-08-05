# Stage 1: Base Node image
FROM node:18-alpine

# Create app directory
WORKDIR /app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY . .

# Creates a "dist" folder with the production build
# RUN npm run build

EXPOSE 3001

# CMD [ "npm", "start" ]
