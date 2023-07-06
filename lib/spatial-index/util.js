import {chain, take} from 'lodash-es'
import booleanIntersects from '@turf/boolean-intersects'
import distance from '@turf/distance'

export function bboxMaxLength([xMin, yMin, xMax, yMax]) {
  return Math.max(
    distance([xMin, yMin], [xMin, yMax]),
    distance([xMin, yMin], [xMax, yMin])
  )
}

export function featureMatches(feature, geometry, filters = {}) {
  for (const [filterKey, filterValue] of Object.entries(filters)) {
    const propertyValue = feature.properties[filterKey]

    if (Array.isArray(propertyValue) && !propertyValue.includes(filterValue)) {
      return false
    }

    if (!Array.isArray(propertyValue) && propertyValue !== filterValue) {
      return false
    }
  }

  if (!geometry) {
    return true
  }

  return booleanIntersects(geometry, feature)
}

export function sortAndPickResults(results, {limit, center}) {
  if (center) {
    return chain(results)
      .sortBy(r => r.properties.distance)
      .take(limit)
      .value()
  }

  return take(results, limit)
}

export function computeScore(distance) {
  return 1 - Math.min(1, distance / 10_000)
}
