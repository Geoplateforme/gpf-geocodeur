import {omit} from 'lodash-es'
import createError from 'http-errors'
import bbox from '@turf/bbox'
import circle from '@turf/circle'
import distance from '@turf/distance'

import {bboxMaxLength, featureMatches, sortAndPickResults, computeScore} from '../../../lib/spatial-index/util.js'

export function extractConfig({rtreeIndex, db}) {
  if (!rtreeIndex || !db) {
    throw new Error('search must be called with db and rtreeIndex params')
  }

  return {rtreeIndex, db}
}

export function reverse(options = {}) {
  const {rtreeIndex, db} = extractConfig(options)
  const {center, filters, returntruegeometry, limit} = options
  let {geometry} = options

  if (!limit) {
    throw createError(400, 'limit is a required param')
  }

  if (!geometry && !center) {
    throw createError(400, 'search must be called with at least geometry or center param')
  }

  if (!geometry) {
    geometry = circle(center, 0.1, {step: 16})
  }

  const geometryBbox = bbox(geometry)

  if (bboxMaxLength(geometryBbox) > 1) {
    throw createError(400, 'geometry bbox height/width must be less than 1km')
  }

  const matchingFeatures = []

  rtreeIndex.search(...geometryBbox, idx => {
    const feature = db.getFeatureByIdx(idx)
    const matches = featureMatches(feature, geometry, filters)

    if (matches) {
      matchingFeatures.push(formatResult(feature, {center, returntruegeometry}))
    }

    return matches
  })

  return sortAndPickResults(
    matchingFeatures,
    {limit, center}
  )
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
