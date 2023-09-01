import createError from 'http-errors'

export function validateStructuredSearchParams({departmentcode, municipalitycode, districtcode}) {
  if (!departmentcode) {
    throw createError(400, 'departmentcode is required for structured search')
  }

  if (!municipalitycode && !districtcode) {
    throw createError(400, 'municipalitycode or districtcode is required for structured search')
  }
}
