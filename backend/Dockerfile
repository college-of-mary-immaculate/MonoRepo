FROM node:latest

WORKDIR ./Lottong-Pinoy-API

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]