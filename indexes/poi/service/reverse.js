import {workerData} from 'node:worker_threads'

import {omit} from 'lodash-es'
import distance from '@turf/distance'
import Flatbush from 'flatbush'

import {computeScore} from '../../../lib/spatial-index/util.js'

import {reverse as reverseBase} from '../../../lib/spatial-index/reverse.js'
import {createInstance} from '../../../lib/spatial-index/lmdb.js'

export function reverse(options) {
  if (!options.db) {
    throw new Error('db is required')
  }

  return reverseBase({
    ...options,
    formatResult,
    getFeatureByIdx: idx => options.db.getFeatureByIdx(idx),
    enableTileIndex: true
  })
}

export function formatResult(feature, {center, distanceCache, returntruegeometry}) {
  const result = {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [feature.properties.lon, feature.properties.lat]
    },
    properties: omit(feature.properties, ['lon', 'lat'])
  }

  if (distanceCache) {
    result.properties.distance = distanceCache
    result.properties.score = computeScore(distanceCache)
  } else if (center) {
    const distance = computeDistance(feature, center)
    result.properties.distance = distance
    result.properties.score = computeScore(distance)
  } else {
    result.properties.distance = 0
  }

  if (returntruegeometry) {
    result.properties.truegeometry = feature.geometry
  }

  return result
}

export function computeDistance(feature, center) {
  const {lon, lat} = feature.properties
  return Math.round(distance(center, [lon, lat]) * 1000)
}

const db = createInstance(workerData.dbPath, {
  geometryType: 'Polygon',
  readOnly: true,
  cache: true
})

const rtreeIndex = Flatbush.from(workerData.rtreeIndexBuffer)

function reverseJob(params) {
  return reverse({...params, db, rtreeIndex})
}

export default reverseJob
