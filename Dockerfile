FROM node:16.13.2

WORKDIR /code

ENV port 80

COPY package.json /code/package.json

RUN npm install

COPY . /code

CMD ["npm", "start"]

#docker build --tag crypto-store-mark-1.

# docker run -p 80:3000 --name  something -d crypto-store-mark-1

