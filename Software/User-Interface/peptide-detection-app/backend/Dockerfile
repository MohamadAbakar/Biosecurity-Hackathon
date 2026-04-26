FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache python3 make g++ udev

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

RUN mkdir -p logs

EXPOSE 5000
CMD ["node", "src/app.js"]
