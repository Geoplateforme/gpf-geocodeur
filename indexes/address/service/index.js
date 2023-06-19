#!/usr/bin/env node
import 'dotenv/config.js'

import process from 'node:process'

import express from 'express'
import morgan from 'morgan'
import {createRouter} from './router.js'

const PORT = process.env.PORT || 5000

const server = express()

if (process.env.NODE_ENV !== 'production') {
  server.disable('x-powered-by')
  server.use(morgan('dev'))
}

server.use('/', await createRouter())

server.listen(PORT, () => {
  console.log(`Start listening on port ${PORT}`)
})