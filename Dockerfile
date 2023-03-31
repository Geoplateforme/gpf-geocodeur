FROM node:18-alpine

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .

ENV NODE_ENV production
ENV PORT 3000

USER node
EXPOSE 3000

CMD ["yarn", "start"]
