import {chain, take} from 'lodash-es'
import createError from 'http-errors'
import booleanIntersects from '@turf/boolean-intersects'
import bbox from '@turf/bbox'
import circle from '@turf/circle'
import distance from '@turf/distance'

function featureMatches(feature, geometry, filters = {}) {
  for (const [filterKey, filterValue] of Object.entries(filters)) {
    if (feature.properties[filterKey] !== filterValue) {
      return false
    }
  }

  if (!geometry) {
    return true
  }

  return booleanIntersects(geometry, feature)
}

function bboxMaxLength([xMin, yMin, xMax, yMax]) {
  return Math.max(
    distance([xMin, yMin], [xMin, yMax]),
    distance([xMin, yMin], [xMax, yMin])
  )
}

function extractConfig({rtreeIndex, db}) {
  if (!rtreeIndex || !db) {
    throw new Error('search must be called with db and rtreeIndex params')
  }

  return {rtreeIndex, db}
}

export function reverse(options = {}) {
  const {rtreeIndex, db} = extractConfig(options)
  const {center, filters, limit} = options
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
      matchingFeatures.push(formatResult(feature, {center}))
    }

    return matches
  })

  return sortAndPickResults(
    matchingFeatures,
    {limit, center}
  )
}

function sortAndPickResults(results, {limit, center}) {
  if (center) {
    return chain(results)
      .sortBy(r => r.properties.distance)
      .take(limit)
      .value()
  }

  return take(results, limit)
}

function formatResult(feature, {center}) {
  const result = {
    type: 'Feature',
    geometry: feature.geometry,
    properties: {...feature.properties}
  }

  if (center) {
    result.properties.distance = computeDistance(feature, center)
  }

  return result
}

function computeDistance(feature, center) {
  return Math.round(distance(center, feature) * 1000)
}
