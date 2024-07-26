FROM node:20-alpine as builder

WORKDIR /build

RUN npm i prisma -g

COPY package*json ./ 

RUN npm i  

COPY ./ ./

RUN npx prisma generate

RUN npm run build:experimental


FROM node:20-alpine

ENV NODE_ENV production

WORKDIR /app

RUN npm i prisma -g

COPY package*json ./ 

RUN npm i  --production

COPY --from=builder --chown=node:node /build/public ./public

COPY --from=builder --chown=node:node /build/.next ./.next

COPY --from=builder --chown=node:node /build/prisma ./prisma

RUN npx prisma generate

CMD ["/bin/sh", "-c", "npx prisma migrate deploy && npm start"]


USER node

CMD ["npm", "start"]