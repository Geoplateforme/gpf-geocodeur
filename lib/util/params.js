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

export function parseValue(value, type) {
  const trimmedValue = value.trim()

  if (!trimmedValue) {
    return undefined
  }

  if (type === 'string' || type === 'custom') {
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
  const {type, array, allowedValues, required, defaultValue, nameInQuery, validate, extract} = definition

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

  // Custom extraction
  if (type === 'custom' && parsedValue) {
    if (!extract) {
      throw new Error('Missing extract function for custom param')
    }

    parsedValue = extract(parsedValue)
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
