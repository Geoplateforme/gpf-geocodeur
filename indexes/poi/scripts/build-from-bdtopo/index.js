#!/usr/bin/env node
/* eslint no-await-in-loop: off */
import 'dotenv/config.js'

import path from 'node:path'
import process from 'node:process'
import {finished} from 'node:stream/promises'
import {Readable} from 'node:stream'
import {createWriteStream} from 'node:fs'
import {rm, mkdir, writeFile} from 'node:fs/promises'

import {downloadAndExtractToTmp, getArchiveURL, getPath} from '../../../../lib/geoservices.js'
import {computeDepartements} from '../../../../lib/cli.js'

import {POI_DATA_PATH, POI_DATA_CATEGORIES_PATH} from '../../util/paths.js'

import {LAYERS, MAIN_CATEGORIES} from './mapping.js'
import {createCommunesIndex} from './communes.js'
import {createAccumulator} from './categories.js'
import {extractFeatures} from './extract.js'

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

for (const codeDepartement of computeDepartements('poi')) {
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
