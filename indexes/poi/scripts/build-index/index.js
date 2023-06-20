#!/usr/bin/env node
/* eslint no-await-in-loop: off, array-element-newline: off */
import 'dotenv/config.js'

import path from 'node:path'
import {createIndexer} from '../../../../lib/spatial-index/indexer.js'
import {POI_INDEX_MDB_BASE_PATH, POI_DATA_PATH} from '../../util/paths.js'
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

await indexer.finish()
