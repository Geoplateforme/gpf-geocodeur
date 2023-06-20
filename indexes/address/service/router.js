import {Router, json} from 'express'

import w from '../../../lib/w.js'
import {createRtree} from '../../../lib/spatial-index/rtree.js'

import {ADDRESS_INDEX_RTREE_PATH} from '../util/paths.js'

import {createDatabase} from './db.js'
import {reverse} from './search.js'

export async function createRouter() {
  const db = await createDatabase()
  const rtreeIndex = await createRtree(ADDRESS_INDEX_RTREE_PATH)

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
