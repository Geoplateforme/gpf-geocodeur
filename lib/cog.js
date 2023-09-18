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
const epcis = await readJson(require.resolve('@etalab/decoupage-administratif/data/epci.json'))
const epcisIndex = keyBy(epcis, 'code')

export function getCommune(code) {
  return communesIndex[code]
}

export function getCommunes() {
  return communes
}

export function getDepartements() {
  return departements
}

export function isPLM(commune) {
  return ['75056', '13055', '69123'].includes(commune.code)
}

export function getCodesCommunesMembresEpci(code) {
  const epci = epcisIndex[code]

  if (!epci) {
    return []
  }

  return epci.membres.map(m => m.code)
}
