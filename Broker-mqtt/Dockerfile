FROM node:20-alpine

WORKDIR /src

RUN npm i prisma -g

COPY package*.json ./
RUN npm install

COPY . .
COPY ./prisma ./prisma

RUN npx prisma generate

EXPOSE 1883




