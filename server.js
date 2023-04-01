#!/usr/bin/env node
import 'dotenv/config.js'

import process from 'node:process'

import express from 'express'
import cors from 'cors'
import morgan from 'morgan'

import createRouter from './lib/routes.js'

const PORT = process.env.PORT || 3000

const app = express()

app.disable('x-powered-by')

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'))
}

if (process.env.CORS_DISABLE !== '1') {
  app.use(cors({origin: true}))
}

app.use('/', createRouter())

app.listen(PORT, () => {
  console.log(`Start listening on port ${PORT}`)
})
