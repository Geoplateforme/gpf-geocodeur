import {createRequire} from 'node:module'
import {readFile} from 'node:fs/promises'
import {deburr, chain} from 'lodash-es'
import Flexsearch from 'flexsearch'
import computeDistance from 'natural/lib/natural/distance/jaro-winkler_distance.js'

const require = createRequire(import.meta.url)

async function readCommunes() {
  const json = await readFile(require.resolve('@etalab/decoupage-administratif/data/communes.json'), {encoding: 'utf8'})
  return JSON.parse(json)
    .filter(commune => ['commune-actuelle', 'arrondissement-municipal'].includes(commune.type))
}

const communes = await readCommunes()

const codesIndex = new Map()
const namesIndex = new Flexsearch.Index({
  tokenize: 'forward',
  optimize: false
})
const smallNamesIndex = new Map()

for (const commune of communes) {
  codesIndex.set(commune.code, commune)

  const normalizedName = normalizeString(commune.nom)
  commune._normalizedNom = normalizedName

  if (normalizedName.length <= 3) {
    smallNamesIndex.set(normalizedName, commune.code)
  } else {
    namesIndex.add(commune.code, normalizedName)
  }
}

function searchCandidates(q) {
  if (q.length <= 3) {
    const candidate = smallNamesIndex.get(q)
    return candidate ? [candidate] : []
  }

  return namesIndex.search(q)
}

export function searchCity(inputString) {
  const normalizedInput = normalizeString(inputString).trim()

  const results = chain(searchCandidates(normalizedInput))
    .map(code => {
      const commune = codesIndex.get(code)

      return {
        code: commune.code,
        score: computeDistance(normalizedInput, commune._normalizedNom, {ignoreCase: false})
      }
    })
    .sortBy(r => -r.score)
    .take(1)
    .value()

  if (results.length === 1) {
    return results[0].code
  }
}

export function normalizeString(string) {
  return deburr(string)
    .toLowerCase()
    .replace(/[^a-z\d]+/g, ' ')
    .replace(/sainte?\s/g, 'st ')
}
