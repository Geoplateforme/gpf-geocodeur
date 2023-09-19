import path from 'node:path'
import {Router, json} from 'express'
import {createCluster} from 'addok-cluster'
import {Piscina} from 'piscina'

import w from '../../../lib/w.js'
import readJson from '../../../lib/read-json.js'
import errorHandler from '../../../lib/error-handler.js'
import readBigFile from '../../../lib/spatial-index/read-big-file.js'
import {createInstance as createRedisServer} from '../../../lib/addok/redis.js'
import {createInstance as createLmdbInstance} from '../../../lib/spatial-index/lmdb.js'

import {POI_INDEX_PATH, POI_INDEX_MDB_PATH, POI_INDEX_CATEGORIES_PATH, POI_INDEX_RTREE_PATH} from '../util/paths.js'

import {search} from './search.js'

export async function createRouter() {
  const db = await createLmdbInstance(POI_INDEX_MDB_PATH, {
    geometryType: 'Polygon',
    readOnly: true,
    cache: true
  })
  const rtreeIndexBuffer = await readBigFile(POI_INDEX_RTREE_PATH, SharedArrayBuffer)
  const redisServer = await createRedisServer(POI_INDEX_PATH, {crashOnFailure: true})
  const addokCluster = await createCluster({
    addokRedisUrl: ['unix:' + redisServer.socketPath],
    addokConfigModule: path.resolve('./indexes/poi/config/addok.conf')
  })

  const categories = await readJson(POI_INDEX_CATEGORIES_PATH)

  const reversePiscina = new Piscina({
    filename: new URL('reverse.js', import.meta.url).href,
    workerData: {
      rtreeIndexBuffer,
      dbPath: POI_INDEX_MDB_PATH
    }
  })

  const router = new Router()

  router.use(json())

  router.post('/search', w(async (req, res) => {
    const results = await search(req.body, {addokCluster, db})
    res.send(results)
  }))

  router.post('/reverse', w(async (req, res) => {
    const result = await reversePiscina.run(req.body)
    res.send(result)
  }))

  router.get('/categories', (req, res) => {
    res.send(categories)
  })

  router.use(errorHandler)

  return router
}
