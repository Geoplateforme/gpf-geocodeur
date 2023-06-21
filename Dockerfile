FROM --platform=linux/amd64 nikolaik/python-nodejs:python3.10-nodejs18-slim

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --prod --frozen-lockfile

COPY lib indexes api ./

ENV NODE_ENV production
ENV PORT 3000

USER node
EXPOSE 3000

CMD ["yarn", "start"]
