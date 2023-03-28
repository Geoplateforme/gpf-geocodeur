import createError from 'http-errors'

export default function validateParams({params, parcel}) {
  const {q, limit} = params

  if (!q && !parcel) {
    throw createError(400, 'Parse query failed', {detail: [
      'Error: Missing [q] parameter'
    ]})
  }

  if (limit > 20) {
    throw createError(400, 'Parse query failed', {detail: [
      'Error: Parameter [limit] must be lower or equal to 20'
    ]})
  }
}
