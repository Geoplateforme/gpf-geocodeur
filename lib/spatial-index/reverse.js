import createError from 'http-errors'
import bbox from '@turf/bbox'
import circle from '@turf/circle'

import {bboxMaxLength, featureMatches, sortAndPickResults} from './util.js'

export function reverse(options) {
  const {rtreeIndex, formatResult, getFeatureByIdx} = options

  if (!rtreeIndex) {
    throw new Error('rtreeIndex is required')
  }

  if (!formatResult) {
    throw new Error('formatResult is required')
  }

  if (!getFeatureByIdx) {
    throw new Error('getFeatureByIdx is required')
  }

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

  if (geometry.type === 'Circle') {
    geometry = circle(geometry.coordinates, geometry.radius / 1000, {step: 16})
  }

  const geometryBbox = bbox(geometry)

  if (bboxMaxLength(geometryBbox) > 1) {
    throw createError(400, 'geometry bbox height/width must be less than 1km')
  }

  const matchingFeatures = []

  rtreeIndex.search(...geometryBbox, idx => {
    const feature = getFeatureByIdx(idx)
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
