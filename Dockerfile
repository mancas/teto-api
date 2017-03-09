FROM node:6
LABEL maintainer manuel.casasbarrado@gmail.com

RUN mkdir -p /opt/api \
  && chown node:node /opt/api

WORKDIR /opt/api
COPY src /opt/api
COPY bin /opt/api
COPY config /opt/api
COPY package.json /opt/api
COPY start.sh /opt/api

RUN npm install

USER node

EXPOSE 3000
ENTRYPOINT ["/opt/api/start.sh"]
CMD ["default"]
