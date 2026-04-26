FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 3000
ENV REACT_APP_API_URL=http://localhost:5000/api
ENV REACT_APP_WS_URL=ws://localhost:5000

CMD ["npm", "start"]
