import process from 'node:process'
import express from 'express'

import w from './util/w.js'
import errorHandler from './util/error-handler.js'

import {createIndexes} from './indexes/index.js'
import search from './operations/search.js'
import reverse from './operations/reverse.js'
import {PARAMS, extractParams} from './params/base.js'

const GEOCODE_INDEXES = process.env.GEOCODE_INDEXES
  ? process.env.GEOCODE_INDEXES.split(',')
  : ['address', 'poi', 'parcel']

export default function createRouter(options = {}) {
  const router = new express.Router()

  const indexes = createIndexes(options.indexes || GEOCODE_INDEXES)

  router.get('/search', w(async (req, res) => {
    const params = extractParams(req.query, {operation: 'search'}, PARAMS)
    const results = await search(params, {indexes})
    res.send({
      type: 'FeatureCollection',
      features: results
    })
  }))

  router.get('/reverse', w(async (req, res) => {
    const params = extractParams(req.query, {operation: 'reverse'})
    const results = await reverse(params, {indexes})
    res.send({
      type: 'FeatureCollection',
      features: results
    })
  }))

  router.use(errorHandler)

  return router
}
