FROM node:8.2.1
LABEL maintainer="juandacorreo@gmail.com"

ENV PORT=3000

# Set working directory
RUN mkdir /app
WORKDIR /app



ENV HOME=/app


# Install app dependencies
COPY package*.json ./
RUN npm install --production


# Configure entrypoint
COPY entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/entrypoint.sh
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

# Bundle app source
COPY . . 


# RUN app

EXPOSE $PORT

USER node

# Run this app when a container is launched
# base image entrypoint will add node command
CMD [ "app-auth.js" ]
