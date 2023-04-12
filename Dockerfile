# Use the official Node.js image.
# https://hub.docker.com/_/node
FROM node:18.14.2

# Install Chromium dependencies
# https://github.com/puppeteer/puppeteer/blob/master/docs/troubleshooting.md#chrome-headless-doesnt-launch-on-unix
RUN apt-get -y update && \
    apt-get --no-install-recommends -y -q install \
      libdrm-dev libdrm-tests \
      libgbm-dev \
      gconf-service libasound2 libatk1.0-0 libatk-bridge2.0-0 \
      libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 \
      libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1\
      libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1\
      libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget && \
    apt-get upgrade -y && \
    apt-get clean

# Create and change to the app directory.
WORKDIR /app

# Copy application dependency manifests to the container image.
# A wildcard is used to ensure copying both package.json AND package-lock.json (when available).
# Copying this first prevents re-running npm install on every code change.
COPY package*.json ./

# Install production dependencies.
RUN npm install
# Copy local code to the container image.
COPY . ./

EXPOSE 8080
# Run the web service on container startup.
CMD [ "npm", "start" ]
