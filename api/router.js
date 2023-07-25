import process from 'node:process'
import path from 'node:path'
import express from 'express'

import w from '../lib/w.js'
import errorHandler from '../lib/error-handler.js'

import {createIndexes} from './indexes/index.js'
import search from './operations/search.js'
import reverse from './operations/reverse.js'
import autocomplete from './operations/autocomplete.js'
import {extractSearchParams, extractReverseParams} from './params/base.js'
import {extractParams as extractAutocompleteParams} from './params/autocomplete.js'
import computeGeocodeCapabilities from './capabilities/geocode.js'
import computeAutocompleteCapabilities from './capabilities/autocomplete.js'

const GEOCODE_INDEXES = process.env.GEOCODE_INDEXES
  ? process.env.GEOCODE_INDEXES.split(',')
  : ['address', 'poi', 'parcel']

export default function createRouter(options = {}) {
  const router = new express.Router()

  const indexes = options.customIndexes || createIndexes(options.indexes || GEOCODE_INDEXES)

  router.get('/search', w(async (req, res) => {
    const params = extractSearchParams(req.query)
    const results = await search(params, {indexes})
    res.send({
      type: 'FeatureCollection',
      features: results
    })
  }))

  router.get('/reverse', w(async (req, res) => {
    const params = extractReverseParams(req.query)
    const results = await reverse(params, {indexes})
    res.send({
      type: 'FeatureCollection',
      features: results
    })
  }))

  router.get('/completion', w(async (req, res) => {
    const params = extractAutocompleteParams(req.query)
    try {
      const results = await autocomplete(params, {indexes})
      res.send({
        status: 'OK',
        results
      })
    } catch (error) {
      res.send({
        status: 'Error',
        error: error.message
      })
    }
  }))

  router.get('/geocodage/getCapabilities', w(async (req, res) => {
    const capabilities = await computeGeocodeCapabilities()
    res.send(capabilities)
  }))

  router.get('/completion/getCapabilities', w(async (req, res) => {
    const capabilities = await computeAutocompleteCapabilities()
    res.send(capabilities)
  }))

  router.get('/geocodage/openapi/geocode.yaml', w((req, res) => {
    res.sendFile(path.resolve('./config/open-api/geocode.yaml'))
  }))

  router.get('/completion/openapi/completion.yaml', w((req, res) => {
    res.sendFile(path.resolve('./config/open-api/completion.yaml'))
  }))

  router.use(errorHandler)

  return router
}
