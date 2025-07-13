FROM node:20-alpine AS builder

# workdir
WORKDIR /app

COPY ./frontend/package*.json ./
RUN npm install
# copy files and build
COPY ./frontend .
RUN npm run build

FROM nginx:alpine

# remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

# copy the build files
COPY --from=builder /app/dist /usr/share/nginx/html
# start nginx
CMD ["nginx", "-g", "daemon off;"]