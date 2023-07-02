import {omit} from 'lodash-es'
import createError from 'http-errors'
import bbox from '@turf/bbox'
import circle from '@turf/circle'
import distance from '@turf/distance'

import {bboxMaxLength, featureMatches, sortAndPickResults, computeScore} from '../../../lib/spatial-index/util.js'

import {getNomCommune} from './cog.js'

const SEARCH_MAX_DISTANCE_IN_KM = 2
const SEARCH_MAX_ITERATIONS = 10_000

function extractConfig({rtreeIndex, db}) {
  if (!rtreeIndex || !db) {
    throw new Error('search must be called with db and rtreeIndex params')
  }

  return {rtreeIndex, db}
}

export function getById(options = {}) {
  const {db} = extractConfig(options)
  const {id, center, returntruegeometry} = options

  if (!id) {
    throw new Error('id is a required param')
  }

  const feature = db.getFeatureById(id)

  if (feature) {
    return formatResult(feature, {center, returntruegeometry})
  }
}

export function search(options = {}) {
  const {rtreeIndex, db} = extractConfig(options)
  const {center, filters, returntruegeometry, limit} = options

  if (!limit) {
    throw createError(400, 'limit is a required param')
  }

  if (!center) {
    throw createError(400, 'center is currently required')
  }

  const [lon, lat] = center
  const matchingFeatures = []

  let iterations = 0

  rtreeIndex.neighbors(lon, lat, 1, Number.POSITIVE_INFINITY, idx => {
    iterations++

    const feature = db.getFeatureByIdx(idx)
    const matches = featureMatches(feature, null, filters)
    const distance = computeDistance(feature, center)

    if (matches && distance <= SEARCH_MAX_DISTANCE_IN_KM) {
      const resultFeature = formatResult(feature, {center, returntruegeometry, distanceCache: distance})
      matchingFeatures.push(resultFeature)
    }

    // Stop iterating if we have reached limit, max distance or SEARCH_MAX_ITERATIONS
    return iterations === SEARCH_MAX_ITERATIONS
      || matchingFeatures.length === limit
      || distance > SEARCH_MAX_DISTANCE_IN_KM
  })

  return sortAndPickResults(
    matchingFeatures,
    {limit, center}
  )
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

function formatResult(feature, {center, distanceCache, returntruegeometry}) {
  const result = {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [feature.properties.lon, feature.properties.lat]
    },
    properties: omit(feature.properties, ['lon', 'lat'])
  }

  const citycode = feature.properties.departmentcode + feature.properties.municipalitycode
  result.properties.city = getNomCommune(citycode)

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

function computeDistance(feature, center) {
  const {lon, lat} = feature.properties
  return Math.round(distance(center, [lon, lat]) * 1000)
}
