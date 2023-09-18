#!/usr/bin/env node
/* eslint no-await-in-loop: off */
import 'dotenv/config.js'

import path from 'node:path'
import {createReadStream} from 'node:fs'
import {copyFile} from 'node:fs/promises'
import {Transform} from 'node:stream'

import {parse, stringify} from 'ndjson'
import {omit} from 'lodash-es'

import {createImporter} from '../../../../lib/addok/importer.js'
import {createIndexer} from '../../../../lib/spatial-index/indexer.js'
import {POI_INDEX_MDB_BASE_PATH, POI_INDEX_PATH, POI_DATA_PATH, POI_DATA_CATEGORIES_PATH, POI_INDEX_CATEGORIES_PATH} from '../../util/paths.js'
import {extractFeatures} from './extract.js'

const INPUT_FILE = path.join(POI_DATA_PATH, 'poi.ndjson')

const indexer = await createIndexer(POI_INDEX_MDB_BASE_PATH, {
  geometryType: 'Mixed',
  idFn: p => p.extrafields.cleabs,
  shouldUseTileIndexFn({properties}) {
    return properties.category.includes('administratif') || properties.category.includes('cours d\'eau')
  }
})

await indexer.writeFeatures(extractFeatures(INPUT_FILE))

const addokImporter = await createImporter(POI_INDEX_PATH, './indexes/poi/config/addok.conf')

// Importing into addok
await addokImporter.batchImport(
  createReadStream(INPUT_FILE)
    .pipe(parse())
    .pipe(new Transform({
      transform(row, enc, cb) {
        const obj = omit(row, ['truegeometry', 'toponym', 'extrafields', 'classification'])
        obj.id = row.extrafields.cleabs
        cb(null, obj)
      },
      objectMode: true
    }))
    .pipe(stringify())
)

// Copy categories file
await copyFile(POI_DATA_CATEGORIES_PATH, POI_INDEX_CATEGORIES_PATH)

await indexer.finish()
await addokImporter.finish()
