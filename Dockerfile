#stage 0: install base dependencies

# Use node version 16.15.0
FROM node:16.15.0@sha256:59eb4e9d6a344ae1161e7d6d8af831cb50713cc631889a5a8c2d438d6ec6aa0f AS dependencies

LABEL maintainer="Heebin Lee <hlee246@myseneca.ca>"
LABEL description="Fragments node.js microservice"

ENV NODE_ENV=production

# We default to use port 8080 in our service
ENV PORT=8080

# Reduce npm spam when installing within Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#loglevel
ENV NPM_CONFIG_LOGLEVEL=warn

# Disable colour when run inside Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#color
ENV NPM_CONFIG_COLOR=false

# Use /app as our working directory
WORKDIR /app

# Copy the package.json and package-lock.json files into the working dir (/app)
COPY package*.json ./

# Copy the package.json and package-lock.json files into /app
COPY --chown=node:node package*.json /app/

# Copy the package.json and package-lock.json files into the working dir (/app)
COPY --chown=node:node package.json package-lock.json ./

#RUN chown root.root
# Install only exact node dependencies defined in package-lock.json
RUN npm ci --only=production
#############################################################################

#stage 1: build the app

FROM node:16.15.0-alpine3.16@sha256:c785e617c8d7015190c0d41af52cc69be8a16e3d9eb7cb21f0bb58bcfca14d6b AS production

WORKDIR /app

RUN apk add --no-cache dumb-init=~1.2.5 curl=~7.83.1 &&\
    npm uninstall sharp &&\
    npm install --platform=linuxmusl sharp@0.30.7

ENV NODE_ENV=production

COPY --chown=node:node --from=dependencies /app /app

# Copy src to /app/src/
COPY --chown=node:node ./src ./src

# Copy our HTPASSWD file
COPY --chown=node:node ./tests/.htpasswd ./tests/.htpasswd

USER node

# Start the container by running our server
CMD ["dumb-init", "node", "src/index.js"]

# We run our service on port 8080
EXPOSE 8080

HEALTHCHECK --interval=15s --timeout=30s --start-period=5s --retries=3 \
CMD curl --fail localhost:8080 || exit 1
