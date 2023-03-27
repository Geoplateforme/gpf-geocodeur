import createError from 'http-errors'

const availableFilters = new Set(['address', 'poi', 'parcel'])

export default function filterIndexes(indexesParam) {
  if (!indexesParam) {
    return ['address']
  }

  const indexes = indexesParam.split(',')
  const validIndexes = indexes.filter(index => {
    if (availableFilters.has(index)) {
      return true
    }

    throw createError(400, `Unknown index id [${index}]`)
  })

  return validIndexes
}
