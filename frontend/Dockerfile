FROM node:24-alpine

WORKDIR /app

# csak a package fájlok először -> gyorsabb build cache
COPY package*.json ./
RUN npm ci

# a forráskódot devnél volume-ból fogjuk mountolni, de buildhez oké
COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
