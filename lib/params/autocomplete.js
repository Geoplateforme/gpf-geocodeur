import createError from 'http-errors'

import {extractSingleParams, isFirstCharValid, isTerrValid, validateLonlat, validateBbox} from '../util/params.js'
import {normalizeQuery} from '../util/querystring.js'
import {poiCategories} from '../poi-categories.js'

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
      const invalidValue = v.find(value => !isTerrValid(value))

      if (invalidValue) {
        throw new Error(`Unexpected value '${invalidValue}' for param terr`)
      }
    }
  },

  poiType: {
    type: 'string',
    allowedValues: poiCategories,
    array: true
  },

  lonlat: {
    type: 'string',
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
    type: 'string',
    validate(v) {
      validateBbox(v)
    }
  }
}

export function extractParams(query) {
  const parsedParams = extractSingleParams(normalizeQuery(query), AUTOCOMPLETE)

  const hasLonlat = 'lonlat' in parsedParams
  const hasBbox = 'bbox' in parsedParams

  if (hasLonlat) {
    const lonlatError = validateLonlat(parsedParams.lonlat)
    if (lonlatError) {
      throw createError(400, 'Failed parsing query', {detail: [lonlatError]})
    }
  }

  if (hasBbox) {
    const bboxError = validateBbox(parsedParams.bbox)
    if (bboxError) {
      throw createError(400, 'Failed parsing query', {detail: [bboxError]})
    }
  }

  return parsedParams
}
