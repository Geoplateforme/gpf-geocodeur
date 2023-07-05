# Stage 1
FROM --platform=linux/amd64 nikolaik/python-nodejs:python3.10-nodejs18-slim AS build
WORKDIR /app

RUN apt-get update && apt-get install -y build-essential gcc

COPY package.json yarn.lock ./
RUN yarn install --prod --frozen-lockfile

RUN pip install --user addok==1.1.1 addok-france==1.1.3 addok-fr==1.0.1

# Stage 2
FROM --platform=linux/amd64 redis:7.0 AS redis

# Stage 3
FROM --platform=linux/amd64 nikolaik/python-nodejs:python3.10-nodejs18-slim
WORKDIR /app

COPY --from=redis /usr/local/bin/redis-server /usr/local/bin/redis-server
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /root/.local /root/.local

RUN apt-get update && apt-get install -y p7zip-full && rm -rf /var/lib/apt/lists/*

COPY . .

ENV PATH=/app/.local/bin:$PATH
ENV NODE_ENV production
ENV TMP_PATH /tmp
ENV DATA_PATH /data
ENV PORT 3000

EXPOSE 3000

CMD ["yarn", "start"]
