import {extractSingleParams, isFirstCharValid, parseFloatAndValidate} from '../util/params.js'
import {normalizeQuery} from '../util/querystring.js'

export function isTerrValid(terr) {
  if (terr === 'METROPOLE' || terr === 'DOMTOM') {
    return true
  }

  if (terr.length < 2 || terr.length > 5 || !isFirstCharValid(terr)) {
    return false
  }

  return true
}

export function validateLonlat(lonlat) {
  const [lon, lat] = lonlat

  if (lon < -180 || lon > 180) {
    throw new Error('lon must be a float between -180 and 180')
  }

  if (lat < -90 || lat > 90) {
    throw new Error('lat must be a float between -90 and 90')
  }
}

export function validateBbox(bbox) {
  const [xmin, ymin, xmax, ymax] = bbox

  if (xmin < -180 || xmin > 180) {
    throw new Error('xmin must be a float between -180 and 180')
  }

  if (ymin < -90 || ymin > 90) {
    throw new Error('ymin must be a float between -90 and 90')
  }

  if (xmax < -180 || xmax > 180) {
    throw new Error('xmax must be a float between -180 and 180')
  }

  if (ymax < -90 || ymax > 90) {
    throw new Error('ymax must be a float between -90 and 90')
  }
}

export const AUTOCOMPLETE = {
  text: {
    type: 'string',
    required: true,
    validate(v) {
      if (v.length < 3 || v.length > 200 || !isFirstCharValid(v)) {
        throw new Error('must contain between 3 and 200 chars and start with a number or a letter')
      }
    }
  },

  terr: {
    type: 'string',
    array: true,
    validate(v) {
      if (v.some(value => !isTerrValid(value))) {
        throw new Error('Unexpected value(s) for param terr')
      }
    }
  },

  poiType: {
    type: 'string',
    array: true
  },

  lonlat: {
    type: 'custom',
    extract(v) {
      const coordinates = v.split(',')

      if (coordinates.length !== 2) {
        throw new Error('lonlat must be in the format "lon,lat"')
      }

      const lon = parseFloatAndValidate(coordinates[0])
      const lat = parseFloatAndValidate(coordinates[1])

      return [lon, lat]
    },
    validate(v) {
      validateLonlat(v)
    }
  },

  type: {
    type: 'string',
    array: true,
    allowedValues: ['PositionOfInterest', 'StreetAddress'],
    defaultValue: ['PositionOfInterest', 'StreetAddress']
  },

  maximumResponses: {
    type: 'integer',
    defaultValue: 10,
    validate(v) {
      if (v < 1 || v > 15) {
        throw new Error('Param limit must be an integer between 1 and 15')
      }
    }
  },

  bbox: {
    type: 'custom',
    extract(v) {
      const coordinates = v.split(',')

      if (coordinates.length !== 4) {
        throw new Error('bbox must be in the format "xmin,ymin,xmax,ymax"')
      }

      const xmin = parseFloatAndValidate(coordinates[0])
      const ymin = parseFloatAndValidate(coordinates[1])
      const xmax = parseFloatAndValidate(coordinates[2])
      const ymax = parseFloatAndValidate(coordinates[3])

      return [xmin, ymin, xmax, ymax]
    },
    validate(v) {
      validateBbox(v)
    }
  }
}

export function extractParams(query) {
  return extractSingleParams(normalizeQuery(query), AUTOCOMPLETE)
}
