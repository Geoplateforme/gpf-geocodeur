FROM --platform=linux/amd64 nikolaik/python-nodejs:python3.10-nodejs18

COPY --from=redis:7.0 /usr/local/bin/redis-server /usr/local/bin/redis-server

WORKDIR /app

RUN apt install p7zip-full
RUN pip install addok==1.1.1 addok-france==1.1.3 addok-fr==1.0.1

COPY package.json yarn.lock ./
RUN yarn install --prod --frozen-lockfile

COPY lib indexes api ./

ENV NODE_ENV production
ENV TMP_PATH /tmp
ENV DATA_PATH /data
ENV PORT 3000

USER node
EXPOSE 3000

CMD ["yarn", "start"]
