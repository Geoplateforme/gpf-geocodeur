import path from 'node:path'
import {Router, json} from 'express'
import {createCluster} from 'addok-cluster'

import w from '../../../lib/w.js'
import readJson from '../../../lib/read-json.js'
import errorHandler from '../../../lib/error-handler.js'
import {createRtree} from '../../../lib/spatial-index/rtree.js'
import {createInstance as createRedisServer} from '../../../lib/addok/redis.js'
import {createInstance as createLmdbInstance} from '../../../lib/spatial-index/lmdb.js'

import {POI_INDEX_PATH, POI_INDEX_MDB_PATH, POI_INDEX_CATEGORIES_PATH, POI_INDEX_RTREE_PATH} from '../util/paths.js'

import {search} from './search.js'
import {reverse} from './reverse.js'

export async function createRouter() {
  const db = await createLmdbInstance(POI_INDEX_MDB_PATH, {
    geometryType: 'Polygon',
    readOnly: true,
    cache: true
  })
  const rtreeIndex = await createRtree(POI_INDEX_RTREE_PATH)
  const redisServer = await createRedisServer(POI_INDEX_PATH)
  const addokCluster = await createCluster({
    addokRedisUrl: ['unix:' + redisServer.socketPath],
    addokConfigModule: path.resolve('./indexes/poi/config/addok.conf')
  })

  const categories = await readJson(POI_INDEX_CATEGORIES_PATH)

  const router = new Router()

  router.use(json())

  router.post('/search', w(async (req, res) => {
    const results = await search(req.body, {addokCluster, db})
    res.send(results)
  }))

  router.post('/reverse', w((req, res) => {
    res.send(reverse({...req.body, db, rtreeIndex}))
  }))

  router.get('/categories', (req, res) => {
    res.send(categories)
  })

  router.use(errorHandler)

  return router
}
