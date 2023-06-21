#!/usr/bin/env node
/* eslint no-await-in-loop: off, array-element-newline: off */
import 'dotenv/config.js'

import path from 'node:path'
import {createReadStream} from 'node:fs'
import {Transform} from 'node:stream'

import {parse, stringify} from 'ndjson'
import {omit} from 'lodash-es'

import {createImporter} from '../../../../lib/addok-importer.js'
import {createIndexer} from '../../../../lib/spatial-index/indexer.js'
import {POI_INDEX_MDB_BASE_PATH, POI_INDEX_PATH, POI_DATA_PATH} from '../../util/paths.js'
import {extractFeatures} from './extract.js'

const INPUT_FILE = path.join(POI_DATA_PATH, 'poi.ndjson')

const indexer = await createIndexer(POI_INDEX_MDB_BASE_PATH, {geometryType: 'Mixed', idFn: p => p.extrafields.cleabs})

const startedAt = Date.now()
const initialCount = indexer.written

const writeFeaturesLoop = setInterval(() => {
  const written = indexer.written - initialCount

  console.log({
    writing: indexer.writing,
    written,
    writeBySec: written / (Date.now() - startedAt) * 1000
  })
}, 2000)

await indexer.writeFeatures(extractFeatures(INPUT_FILE))

clearInterval(writeFeaturesLoop)

const addokImporter = await createImporter(POI_INDEX_PATH, './indexes/poi/config/addok.conf')

// Importing into addok
await addokImporter.batchImport(
  createReadStream(INPUT_FILE)
    .pipe(parse())
    .pipe(new Transform({
      transform(row, enc, cb) {
        cb(null, omit(row, ['truegeometry', 'toponym']))
      },
      objectMode: true
    }))
    .pipe(stringify())
)

await indexer.finish()
await addokImporter.finish()
