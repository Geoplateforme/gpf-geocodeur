import express from 'express'

import w from './util/w.js'
import errorHandler from './util/error-handler.js'

import validateParams from './params.js'
import search from './operations/search.js'
import reverse from './operations/reverse.js'

export default function createRouter() {
  const router = new express.Router()

  router.get('/search', w(async (req, res) => {
    const params = validateParams(req.query, {operation: 'search'})
    const results = await search(params)
    res.send(results)
  }))

  router.get('/reverse', w(async (req, res) => {
    const params = validateParams(req.query, {operation: 'reverse'})
    const results = await reverse(params)
    res.send(results)
  }))

  router.use(errorHandler)

  return router
}
