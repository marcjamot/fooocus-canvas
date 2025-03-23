FROM node
WORKDIR /opt/fooocus-canvas
COPY package.json package-lock.json ./
RUN npm i
COPY . .
CMD [ "npm", "run", "dev" ]
