import {Router, json} from 'express'

import w from '../../../lib/w.js'
import errorHandler from '../../../lib/error-handler.js'
import {createRtree} from '../../../lib/spatial-index/rtree.js'
import {createInstance} from '../../../lib/spatial-index/lmdb.js'

import {PARCEL_INDEX_RTREE_PATH, PARCEL_INDEX_MDB_PATH} from '../util/paths.js'

import {getById, search, reverse} from './search.js'

export async function createRouter() {
  const db = await createInstance(PARCEL_INDEX_MDB_PATH, {
    geometryType: 'Polygon',
    readOnly: true,
    cache: true
  })

  const rtreeIndex = await createRtree(PARCEL_INDEX_RTREE_PATH)

  const router = new Router()

  router.use(json())

  router.post('/search', w((req, res) => {
    const params = {...req.body, db, rtreeIndex}

    if (params.id) {
      const result = getById(params)
      return res.send(result ? [result] : [])
    }

    res.send(search(params))
  }))

  router.post('/reverse', w((req, res) => {
    res.send(reverse({...req.body, db, rtreeIndex}))
  }))

  router.use(errorHandler)

  return router
}
