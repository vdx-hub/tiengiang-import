FROM node:alpine
RUN mkdir /app
WORKDIR /app
COPY node_modules/ ./
COPY package.json ./
COPY ./src ./src

# dev with nodemon
# RUN npm install nodemon && npm install

# CMD npm run start
CMD npm run dev