import path from 'node:path'
import {Router, json} from 'express'
import {createCluster} from 'addok-cluster'
import {pick} from 'lodash-es'

import w from '../../../lib/w.js'
import readJson from '../../../lib/read-json.js'
import errorHandler from '../../../lib/error-handler.js'
import {createInstance as createRedisServer} from '../../../lib/addok/redis.js'
import {createInstance as createLmdbInstance} from '../../../lib/spatial-index/lmdb.js'

import {POI_INDEX_PATH, POI_INDEX_MDB_PATH, POI_INDEX_CATEGORIES_PATH} from '../util/paths.js'

const POI_FIELDS = [
  'name',
  'toponym',
  'category',
  'postcode',
  'citycode',
  'city',
  'extrafields'
]

export async function createRouter() {
  const db = await createLmdbInstance(POI_INDEX_MDB_PATH, {
    geometryType: 'Polygon',
    readOnly: true,
    cache: true
  })
  const redisServer = await createRedisServer(POI_INDEX_PATH)
  const addokCluster = await createCluster({
    addokRedisUrl: ['unix:' + redisServer.socketPath],
    addokConfigModule: path.resolve('./indexes/poi/config/addok.conf')
  })

  const categories = await readJson(POI_INDEX_CATEGORIES_PATH)

  const router = new Router()

  router.use(json())

  router.post('/search', w(async (req, res) => {
    const results = await addokCluster.geocode(req.body)
    res.send(results.map(result => {
      const {id} = result.properties
      const storedFeature = db.getFeatureById(id)

      const properties = {
        ...pick(storedFeature.properties, POI_FIELDS),
        score: result.properties.score
      }

      if (req.body.returntruegeometry) {
        properties.truegeometry = JSON.stringify(storedFeature.geometry)
      }

      return {
        type: 'Feature',
        geometry: result.geometry,
        properties
      }
    }))
  }))

  router.get('/categories', (req, res) => {
    res.send(categories)
  })

  router.use(errorHandler)

  return router
}
