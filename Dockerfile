FROM node:alpine

RUN npm install -g http-server


WORKDIR /app

COPY . .
EXPOSE 5100

CMD ["http-server", "-p", "5100"]
