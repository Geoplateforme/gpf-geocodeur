import {Router, json} from 'express'

import w from '../../../lib/w.js'

import {createDatabase} from './db.js'
import {createRtree} from './rtree.js'
import {reverse} from './search.js'

export async function createRouter() {
  const db = await createDatabase()
  const rtreeIndex = await createRtree()

  const router = new Router()

  router.use(json())

  router.post('/reverse', w((req, res) => {
    res.send(reverse({...req.body, db, rtreeIndex}))
  }))

  router.use((err, req, res, _next) => {
    res.status(err.statusCode || 500).send({
      code: err.statusCode || 500,
      message: err.message
    })
  })

  return router
}
