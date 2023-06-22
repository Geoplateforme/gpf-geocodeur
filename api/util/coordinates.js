import center from '@turf/center'
import bboxPolygon from '@turf/bbox-polygon'

export function validateCoordinatesValue(coordinates) {
  if (!coordinates || coordinates.length !== 2) {
    throw new Error('Coordinates must be an array of two entries')
  }

  if (coordinates.some(c => typeof c !== 'number' || Number.isNaN(c))) {
    throw new Error('Coordinates must be an array of float numbers')
  }

  const [lon, lat] = coordinates

  if (lon < -180 || lon > 180) {
    throw new Error('Longitude must be a float between -180 and 180')
  }

  if (lat < -85 || lat > 85) {
    throw new Error('Latitude must be a float between -85 and 85')
  }
}

export function getCoordinates(params) {
  const {bbox, lonlat} = params

  if (!lonlat && !bbox) {
    return
  }

  if (lonlat) {
    return {
      lon: lonlat[0],
      lat: lonlat[1]
    }
  }

  if (bbox) {
    const {geometry} = center(bboxPolygon(bbox))

    return {
      lon: geometry.coordinates[0],
      lat: geometry.coordinates[1]
    }
  }
}
