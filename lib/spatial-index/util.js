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
    if (feature.properties[filterKey] !== filterValue) {
      return false
    }
  }

  if (!geometry) {
    return true
  }

  return booleanIntersects(geometry, feature)
}
