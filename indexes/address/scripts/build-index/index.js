#!/usr/bin/env node
/* eslint no-await-in-loop: off, array-element-newline: off */
import 'dotenv/config.js'

import process from 'node:process'
import {createSpatialIndexBuilder} from './spatial-index.js'
import {extractItems} from './extract.js'

const ALL_DEPARTEMENTS = [
  '01', '02', '03', '04', '05', '06', '07', '08', '09',
  '10', '11', '12', '13', '14', '15', '16', '17', '18', '19',
  '2A', '2B', '21', '22', '23', '24', '25', '26', '27', '28', '29',
  '30', '31', '32', '33', '34', '35', '36', '37', '38', '39',
  '40', '41', '42', '43', '44', '45', '46', '47', '48', '49',
  '50', '51', '52', '53', '54', '55', '56', '57', '58', '59',
  '60', '61', '62', '63', '64', '65', '66', '67', '68', '69',
  '70', '71', '72', '73', '74', '75', '76', '77', '78', '79',
  '80', '81', '82', '83', '84', '85', '86', '87', '88', '89',
  '90', '91', '92', '93', '94', '95',
  '971', '972', '973', '974', '975', '976', '977', '978',
  '984', '986', '987', '988', '989'
]

const {BAN_ADDOK_URL} = process.env

export function getFileUrl(codeDepartement) {
  return BAN_ADDOK_URL.replace('{dep}', codeDepartement)
}

const DEPARTEMENTS = process.env.DEPARTEMENTS
  ? process.env.DEPARTEMENTS.split(',')
  : ALL_DEPARTEMENTS

const indexBuilder = await createSpatialIndexBuilder()

for (const codeDepartement of DEPARTEMENTS) {
  console.log(codeDepartement)

  const fileUrl = getFileUrl(codeDepartement)

  const startedAt = Date.now()
  const initialCount = indexBuilder.written

  const writeFeaturesLoop = setInterval(() => {
    const written = indexBuilder.written - initialCount

    console.log({
      writing: indexBuilder.writing,
      written,
      writeBySec: written / (Date.now() - startedAt) * 1000
    })
  }, 2000)

  await indexBuilder.writeItems(extractItems(fileUrl))

  clearInterval(writeFeaturesLoop)
}

await indexBuilder.finish()
