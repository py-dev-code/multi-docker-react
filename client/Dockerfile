FROM node:16-alpine
WORKDIR '/app'
COPY package.json .
RUN npm install
COPY . .
# This will put all the prod assets in app/build directory
RUN npm run build

# 2nd phase of the build
FROM nginx
EXPOSE 3000
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/build /usr/share/nginx/html
