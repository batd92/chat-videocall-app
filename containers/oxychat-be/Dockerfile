FROM node:18
LABEL maintainer="BE"

WORKDIR /app

COPY ../backend/package.json .
COPY ../backend/package-lock.json .

RUN npm ci --omit=dev

COPY ../backend/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main.js"]
