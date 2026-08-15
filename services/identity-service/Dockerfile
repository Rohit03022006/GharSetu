FROM node:20-alpine

RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install --no-audit --no-fund && \
    npx prisma generate && \
    npm cache clean --force && \
    rm -rf /root/.npm /tmp/* /root/.cache

COPY . .

EXPOSE 4001

CMD sh -c "npx prisma db push --skip-generate && node server.js"
