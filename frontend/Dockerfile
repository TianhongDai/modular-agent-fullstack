FROM node:20-alpine
# create the app
WORKDIR /app
# copy package json
COPY package*.json ./
# install the package
RUN npm install
# run the dev mode
CMD ["sh", "-c", "npm install && npm run dev -- --host 0.0.0.0"]