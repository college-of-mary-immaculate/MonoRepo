FROM node:latest
WORKDIR /frontend
COPY package*.json ./
RUN npm install
RUN npm run build
COPY . .
EXPOSE 8000
CMD ["npm", "run", "dev"]