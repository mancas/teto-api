FROM node:6
LABEL maintainer manuel.casasbarrado@gmail.com

RUN apt update

RUN mkdir -p /opt/api \
  && chown node:node /opt/api

WORKDIR /opt/api
COPY src /opt/api/src
COPY bin /opt/api/bin
COPY config /opt/api/config
COPY package.json /opt/api
COPY start.sh /opt/api
COPY public /opt/api/public

RUN chmod -R 777 /opt/api/public

RUN npm install

USER node

EXPOSE 3000
ENTRYPOINT ["/opt/api/start.sh"]
CMD ["default"]
