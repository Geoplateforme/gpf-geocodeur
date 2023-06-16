import {getCommunes} from '../../../lib/cog.js'

const communes = getCommunes()
const nomsCommunes = new Map()

for (const communeActuelle of communes.filter(c => c.type === 'commune-actuelle')) {
  const {code, nom, anciensCodes} = communeActuelle
  nomsCommunes.set(code, nom)

  if (anciensCodes) {
    for (const ancienCode of anciensCodes) {
      nomsCommunes.set(ancienCode, nom)
    }
  }
}

export function getNomCommune(codeCommune) {
  return nomsCommunes.get(codeCommune)
}
