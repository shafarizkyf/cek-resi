FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY --from=builder /app/.next ./.next

EXPOSE 3000

CMD ["npm", "start"]
