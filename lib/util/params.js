import createError from 'http-errors'

export function isFirstCharValid(string) {
  return (string.slice(0, 1).toLowerCase() !== string.slice(0, 1).toUpperCase())
    || (string.codePointAt(0) >= 48 && string.codePointAt(0) <= 57)
}

export function isDepartmentcodeValid(departmentcode) {
  if (departmentcode.length < 2 || departmentcode.length > 3 || departmentcode === '20') {
    return false
  }

  if (departmentcode.length === 3) {
    if (departmentcode >= '971' && departmentcode <= '978') {
      return true
    }

    return false
  }

  if ((departmentcode >= '01' && departmentcode <= '95' && /\d{2}/.test(departmentcode)) || departmentcode === '2A' || departmentcode === '2B') {
    return true
  }

  return false
}

export function parseFloatAndValidate(value) {
  if (!/^[+-]?(\d+(\.\d*)?)$/.test(value)) {
    throw new TypeError('Unable to parse value as float')
  }

  const num = Number.parseFloat(value)

  if (Number.isNaN(num)) {
    throw new TypeError('Unable to parse value as float')
  }

  return num
}

export function isTerrValid(terr) {
  if (terr === 'METROPOLE' || terr === 'DOM') {
    return true
  }

  if (/^[A-Za-z]+$/.test(terr)) {
    return false
  }

  if (terr.length >= 2 && terr.length <= 5) {
    return true
  }

  return false
}

export function validateLonlat(lonlat) {
  const coordinates = lonlat.split(',')

  if (coordinates.length !== 2) {
    throw new Error('lonlat must be in the format "lon,lat"')
  }

  const lon = parseFloatAndValidate(coordinates[0])
  const lat = parseFloatAndValidate(coordinates[1])

  if (lon < -180 || lon > 180) {
    throw new Error('lon must be a float between -180 and 180')
  }

  if (lat < -90 || lat > 90) {
    throw new Error('lat must be a float between -90 and 90')
  }
}

export function validateBbox(bbox) {
  const coordinates = bbox.split(',')

  if (coordinates.length !== 4) {
    throw new Error('bbox must be in the format "xmin,ymin,xmax,ymax"')
  }

  const xmin = parseFloatAndValidate(coordinates[0])
  const ymin = parseFloatAndValidate(coordinates[1])
  const xmax = parseFloatAndValidate(coordinates[2])
  const ymax = parseFloatAndValidate(coordinates[3])

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

export function parseValue(value, type) {
  const trimmedValue = value.trim()

  if (!trimmedValue) {
    return undefined
  }

  if (type === 'string') {
    return trimmedValue
  }

  if (type === 'integer') {
    if (!/^([+-]?[1-9]\d*|0)$/.test(trimmedValue)) {
      throw new TypeError('Unable to parse value as integer')
    }

    const num = Number.parseInt(trimmedValue, 10)

    if (Number.isNaN(num)) {
      throw new TypeError('Unable to parse value as integer')
    }

    if (!Number.isSafeInteger(num)) {
      throw new TypeError('Unable to parse value as integer')
    }

    return num
  }

  if (type === 'float') {
    return parseFloatAndValidate(trimmedValue)
  }

  if (type === 'boolean') {
    const lcValue = trimmedValue.toLowerCase()

    if (['1', 'true', 'yes'].includes(lcValue)) {
      return true
    }

    if (['0', 'false', 'no'].includes(lcValue)) {
      return false
    }

    throw new Error('Unable to parse value as boolean')
  }

  throw new TypeError('Unsupported value type: ' + type)
}

export function parseArrayValues(values, type) {
  const arrayValues = values.split(',')
    .map(v => parseValue(v, type))
    .filter(Boolean)

  return arrayValues.length > 0 ? arrayValues : undefined
}

export function extractParam(query, paramName, definition) {
  const {type, array, allowedValues, required, defaultValue, nameInQuery, validate} = definition

  const rawValue = query[nameInQuery || paramName]
  let parsedValue

  // Parsing
  if (rawValue) {
    parsedValue = array
      ? parseArrayValues(rawValue, type)
      : parseValue(rawValue, type)
  }

  // Enum
  if (parsedValue && allowedValues) {
    if (array) {
      const unexpectedValue = parsedValue.find(v => !allowedValues.includes(v))
      if (unexpectedValue) {
        throw new Error(`Unexpected value '${unexpectedValue}' for param ${paramName}`)
      }
    } else if (!allowedValues.includes(parsedValue)) {
      throw new Error(`Unexpected value '${parsedValue}' for param ${paramName}`)
    }
  }

  // Validation
  if (parsedValue !== undefined && validate) {
    validate(parsedValue)
  }

  // Required
  if (parsedValue === undefined && required) {
    throw new Error(`${paramName} is a required param`)
  }

  // Default value
  if (parsedValue === undefined && defaultValue) {
    parsedValue = defaultValue
  }

  // Dedupe
  if (Array.isArray(parsedValue)) {
    parsedValue = [...new Set(parsedValue)]
  }

  return parsedValue
}

export function extractSingleParams(query, paramsDefinition) {
  const params = {}
  const errors = []

  for (const [paramName, definition] of Object.entries(paramsDefinition)) {
    try {
      const parsedValue = extractParam(query, paramName, definition)
      if (parsedValue !== undefined) {
        params[paramName] = parsedValue
      }
    } catch (error) {
      errors.push(error.message)
    }
  }

  if (errors.length > 0) {
    throw createError(400, 'Failed parsing query', {detail: errors})
  }

  return params
}
