import {createRequire} from 'node:module'
import {readFile} from 'node:fs/promises'
import {keyBy} from 'lodash-es'

const require = createRequire(import.meta.url)

async function readCommunes() {
  const json = await readFile(require.resolve('@etalab/decoupage-administratif/data/communes.json'), {encoding: 'utf8'})
  return JSON.parse(json)
    .filter(commune => ['commune-actuelle', 'arrondissement-municipal'].includes(commune.type))
}

const communes = await readCommunes()
const communesIndex = keyBy(communes, 'code')

export function getCommune(code) {
  return communesIndex[code]
}

export function getCommunes() {
  return communes
}
