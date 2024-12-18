# This is a dockerfile for building Docker image of Fragments-ui application

## Stage 0: Install apline linux + node +dependencies 
FROM node:20.13.0@sha256:a6385a6bb2fdcb7c48fc871e35e32af8daaa82c518900be49b76d10c005864c2 AS dependencies


LABEL maintainer="Maryam Najibi<snajibi@myseneca.ca>" \
      description="Fragments-ui Parcel web application"

# Reduce npm spam when installing within Docker
ENV NPM_CONFIG_LOGLEVEL=warn

#disable colour when run inside Docker
ENV NPM_CONFIG_COLOR=false

#Copy the package*.json file to current repo which is /app
COPY package*.json ./

# Install node dependencies defined in package-lock.json
RUN npm ci --only=build

############################################################
## Stage 2

# Build stage
FROM dependencies AS build

WORKDIR /app

COPY --from=dependencies . .

#Copy src to /app/src/
COPY ./src/. ./src
COPY ./.env ./

RUN npm run build

# Start with nginx on Debian
FROM nginx:stable As production

# Use /usr/local/src/fragments-ui as our working directory
WORKDIR /usr/local/src/fragments-ui

# Copy the dist folder in the static folder 
COPY --from=build ./app/dist/ /usr/share/nginx/html/

# nginx will be running on port 80
EXPOSE 80