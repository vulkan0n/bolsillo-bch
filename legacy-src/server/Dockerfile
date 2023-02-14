FROM node:lts-alpine3.15
WORKDIR /
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
EXPOSE 4000
CMD ["npm", "start"]