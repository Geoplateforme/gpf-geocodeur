/* eslint array-element-newline: off, no-await-in-loop: off */
import 'dotenv/config.js'

import path from 'node:path'
import process from 'node:process'
import {finished} from 'node:stream/promises'
import {Readable} from 'node:stream'
import {createWriteStream} from 'node:fs'
import {rm, mkdir, writeFile} from 'node:fs/promises'

import {downloadAndExtractToTmp, getArchiveURL, getPath} from '../../../../lib/geoservices.js'

import {POI_DATA_PATH, POI_DATA_CATEGORIES_PATH} from '../../util/paths.js'

import {LAYERS, MAIN_CATEGORIES} from './mapping.js'
import {createCommunesIndex} from './communes.js'
import {createAccumulator} from './categories.js'
import {extractFeatures} from './extract.js'

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
  '971', '972', '973', '974', '975', '976', '977', '978'
]

const DEPARTEMENTS = process.env.DEPARTEMENTS
  ? process.env.DEPARTEMENTS.split(',')
  : ALL_DEPARTEMENTS

const {BDTOPO_URL} = process.env

const communesIndex = await createCommunesIndex()
const cleabsUniqIndex = new Set()
const categoriesAccumulator = createAccumulator(MAIN_CATEGORIES)

const COMPUTED_FIELDS_SCHEMA = {
  name: Array,
  toponym: String,
  category: Array,
  classification: Number,
  postcode: Array,
  citycode: Array,
  city: Array
}

await mkdir(POI_DATA_PATH, {recursive: true})
const outputFile = createWriteStream(path.join(POI_DATA_PATH, 'poi.ndjson'), {encoding: 'utf8'})

for (const codeDepartement of DEPARTEMENTS) {
  console.log(codeDepartement)

  const archiveUrl = getArchiveURL(BDTOPO_URL, codeDepartement)
  const archiveDirPath = await downloadAndExtractToTmp(archiveUrl)
  const datasetPath = await getPath(archiveDirPath, 'BDT_3-3_GPKG_*.gpkg')

  const featureStream = Readable.from(extractFeatures({
    datasetPath,
    computedFieldsSchema: COMPUTED_FIELDS_SCHEMA,
    layersDefinitions: LAYERS,
    cleabsUniqIndex,
    communesIndex,
    categoriesAccumulator
  }))

  featureStream.pipe(outputFile, {end: false})
  await finished(featureStream)

  await rm(archiveDirPath, {recursive: true})
}

await writeFile(
  POI_DATA_CATEGORIES_PATH,
  JSON.stringify(categoriesAccumulator.getSummary())
)

outputFile.end()
await finished(outputFile)

await communesIndex.close()
