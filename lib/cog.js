import {createRequire} from 'node:module'
import {keyBy} from 'lodash-es'
import readJson from './read-json.js'

const require = createRequire(import.meta.url)

async function readCommunes() {
  const rows = await readJson(require.resolve('@etalab/decoupage-administratif/data/communes.json'))
  return rows
    .filter(commune => ['commune-actuelle', 'arrondissement-municipal'].includes(commune.type))
}

const communes = await readCommunes()
const communesIndex = keyBy(communes, 'code')
const departements = await readJson(require.resolve('@etalab/decoupage-administratif/data/departements.json'))

export function getCommune(code) {
  return communesIndex[code]
}

export function getCommunes() {
  return communes
}

export function getDepartements() {
  return departements
}
