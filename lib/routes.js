import express from 'express'

import w from './util/w.js'
import errorHandler from './util/error-handler.js'

import search from './operations/search.js'
import reverse from './operations/reverse.js'

export default function createRouter() {
  const router = new express.Router()

  router.get('/search', w(async (req, res) => {
    const results = await search(req.query)

    res.send(results)
  }))

  router.get('/reverse', w(async (req, res) => {
    const results = await reverse(req.query)

    res.send(results)
  }))

  router.use(errorHandler)

  return router
}
