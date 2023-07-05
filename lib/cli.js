import process from 'node:process'
import {getDepartements} from './cog.js'

const UNSUPPORTED_OVERSEAS = {
  address: [],
  parcel: ['975', '984', '986', '987', '988', '989'],
  poi: ['984', '986', '987', '988', '989']
}

export function computeDepartements(index) {
  const baseList = process.env.DEPARTEMENTS
    ? process.env.DEPARTEMENTS.split(',')
    : getDepartements().map(d => d.code)

  return baseList.filter(d => !UNSUPPORTED_OVERSEAS[index].includes(d))
}
