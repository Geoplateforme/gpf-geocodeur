import path from 'node:path'
import {Router, json} from 'express'
import {createCluster} from 'addok-cluster'

import w from '../../../lib/w.js'
import {createRtree} from '../../../lib/spatial-index/rtree.js'
import {createInstance as createRedisServer} from '../../../lib/addok/redis.js'

import {ADDRESS_INDEX_RTREE_PATH, ADDRESS_INDEX_PATH} from '../util/paths.js'

import {createDatabase} from './db.js'
import {reverse} from './reverse.js'

export async function createRouter() {
  const db = await createDatabase()
  const rtreeIndex = await createRtree(ADDRESS_INDEX_RTREE_PATH)
  const redisServer = await createRedisServer(ADDRESS_INDEX_PATH)
  const addokCluster = await createCluster({
    addokRedisUrl: ['unix:' + redisServer.socketPath],
    addokConfigModule: path.resolve('./indexes/address/config/addok.conf')
  })

  const router = new Router()

  router.use(json())

  router.post('/search', w(async (req, res) => {
    const results = await addokCluster.geocode(req.body)
    res.send(results)
  }))

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
