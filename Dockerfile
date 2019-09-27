FROM node:carbon
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
RUN npm install pm2 -g
# RUN npm install --only=production
COPY . .
EXPOSE 3333
# EXPOSE 43554
CMD ["pm2-docker", "start", "process.json"]
