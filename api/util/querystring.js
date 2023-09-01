export function ensureSingleValue(value) {
  return Array.isArray(value) ? value.pop() : value
}

export function normalizeQuery(query) {
  const normalizedQuery = {}

  for (const [key, value] of Object.entries(query)) {
    normalizedQuery[key.trim()] = ensureSingleValue(value).trim()
  }

  return normalizedQuery
}
