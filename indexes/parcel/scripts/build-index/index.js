#!/usr/bin/env node
/* eslint no-await-in-loop: off */
import 'dotenv/config.js'

import process from 'node:process'
import {rm} from 'node:fs/promises'

import {downloadAndExtractToTmp, getArchiveURL, getPath} from '../../../../lib/geoservices.js'
import {computeDepartements} from '../../../../lib/cli.js'
import {createIndexer} from '../../../../lib/spatial-index/indexer.js'

import {PARCEL_INDEX_MDB_BASE_PATH} from '../../util/paths.js'

import {readFeatures} from './gdal.js'
import {transformParcel} from './transform.js'

const {PARCELLAIRE_EXPRESS_URL} = process.env

const indexer = await createIndexer(PARCEL_INDEX_MDB_BASE_PATH, {geometryType: 'Polygon'})

for (const codeDepartement of computeDepartements('parcel')) {
  console.log(codeDepartement)

  const archiveUrl = getArchiveURL(PARCELLAIRE_EXPRESS_URL, codeDepartement)
  const archiveDirPath = await downloadAndExtractToTmp(archiveUrl)

  const parcelleShpPath = await getPath(archiveDirPath, 'PARCELLE.SHP')

  await indexer.writeFeatures(readFeatures(parcelleShpPath, transformParcel))

  await rm(archiveDirPath, {recursive: true})
}

await indexer.finish()
