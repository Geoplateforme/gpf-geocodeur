import {readFile} from 'node:fs/promises'
import {keyBy} from 'lodash-es'

const data = await readFile('./node_modules/@etalab/decoupage-administratif/data/communes.json', {encoding: 'utf8'})
const communes = JSON.parse(data).filter(c => ['arrondissement-municipal', 'commune-actuelle'].includes(c.type))
const communesIndex = keyBy(communes, 'code')

export function getCommune(code) {
  return communesIndex[code]
}
