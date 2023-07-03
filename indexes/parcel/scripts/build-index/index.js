#!/usr/bin/env node
/* eslint no-await-in-loop: off, array-element-newline: off */
import 'dotenv/config.js'

import process from 'node:process'
import {rm} from 'node:fs/promises'

import {downloadAndExtractToTmp, getArchiveURL, getPath} from '../../../../lib/geoservices.js'
import {createIndexer} from '../../../../lib/spatial-index/indexer.js'

import {PARCEL_INDEX_MDB_BASE_PATH} from '../../util/paths.js'

import {readFeatures} from './gdal.js'
import {transformParcel} from './transform.js'

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
  '971', '972', '973', '974', '976', '977', '978'
]

const DEPARTEMENTS = process.env.DEPARTEMENTS
  ? process.env.DEPARTEMENTS.split(',')
  : ALL_DEPARTEMENTS

const {PARCELLAIRE_EXPRESS_URL} = process.env

const indexer = await createIndexer(PARCEL_INDEX_MDB_BASE_PATH, {geometryType: 'Polygon'})

for (const codeDepartement of DEPARTEMENTS) {
  console.log(codeDepartement)

  const archiveUrl = getArchiveURL(PARCELLAIRE_EXPRESS_URL, codeDepartement)
  const archiveDirPath = await downloadAndExtractToTmp(archiveUrl)

  const parcelleShpPath = await getPath(archiveDirPath, 'PARCELLE.SHP')

  await indexer.writeFeatures(readFeatures(parcelleShpPath, transformParcel))

  await rm(archiveDirPath, {recursive: true})
}

await indexer.finish()
