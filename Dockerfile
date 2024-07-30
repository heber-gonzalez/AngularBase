# ### STAGE 1: Build ###
# FROM node:lts-alpine3.16 AS build
# RUN mkdir -p /home/node/app
# WORKDIR /home/node/app
# COPY yarn.lock ./
# COPY . .
# RUN yarn install
# RUN yarn run build --base-href=/base/

# ### STAGE 2: Run ###
# FROM nginx:1.23.3-alpine-slim
# COPY nginx.conf /etc/nginx/nginx.conf
# #COPY --from=build /nginx.conf /etc/nginx/conf.d/default.conf
# COPY --from=build /home/node/app/www /usr/share/nginx/html/base

# Use official node image as the base image
FROM node:lts as build

ADD ./package.json /tmp/package.json
RUN cd /tmp && yarn install
RUN mkdir -p /usr/local/app && cp -a /tmp/node_modules /usr/local/app/

WORKDIR /usr/local/app

# Add the source code from the app to the container
COPY ./ /usr/local/app/

# Generate the build of the application
RUN yarn run build

# Stage 2: Serve app with nginx server
# Use official nginx image as the base image
FROM nginx:latest

# Copy the build output to replace the default nginx contents.
COPY --from=build /usr/local/app/dist/angular-base/browser /usr/share/nginx/html

# This line is IMPORTANT, we will breakdown it on a minute.
# COPY ./entrypoint.sh /usr/local/app/entrypoint.sh

# Copy the nginx conf that we created to the container
COPY ./nginx.conf  /etc/nginx/conf.d/default.conf

# Expose ports
EXPOSE 80 443 6006 4200

# RUN chmod +x /usr/local/app/entrypoint.sh
# ENTRYPOINT [ "/usr/local/app/entrypoint.sh" ]
