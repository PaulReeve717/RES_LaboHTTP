FROM node:15.13.0
COPY src ./src
COPY package*.json .
RUN npm install
EXPOSE 3000
CMD ["npm", "start"]
