FROM node:8-jessie

RUN mkdir /app
WORKDIR /app

RUN npm install ripple-lib@1.1.2 request@2.88.0

COPY . /app
