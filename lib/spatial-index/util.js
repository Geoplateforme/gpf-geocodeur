import {chain, take} from 'lodash-es'
import tilebelt from '@mapbox/tilebelt'
import booleanIntersects from '@turf/boolean-intersects'
import distance from '@turf/distance'
import bbox from '@turf/bbox'

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

const TILE_INDEX_ZOOM_LEVEL = 13

function extractIntersectingTilesRecurse(geometry, baseTile, zoomLevel) {
  if (baseTile[2] > zoomLevel) {
    return []
  }

  const tilePolygon = tilebelt.tileToGeoJSON(baseTile)

  if (booleanIntersects(geometry, tilePolygon)) {
    if (baseTile[2] === zoomLevel) {
      return [baseTile]
    }

    const intersectingTiles = []

    for (const childTile of tilebelt.getChildren(baseTile)) {
      const tiles = extractIntersectingTilesRecurse(geometry, childTile, zoomLevel)
      intersectingTiles.push(...tiles)
    }

    return intersectingTiles
  }

  return []
}

export function extractIntersectingTiles(geometry) {
  let baseTile = tilebelt.bboxToTile(bbox(geometry))

  while (baseTile[2] > TILE_INDEX_ZOOM_LEVEL) {
    baseTile = tilebelt.getParent(baseTile)
  }

  return extractIntersectingTilesRecurse(geometry, baseTile, TILE_INDEX_ZOOM_LEVEL)
    .map(t => `${t[2]}/${t[0]}/${t[1]}`)
}
