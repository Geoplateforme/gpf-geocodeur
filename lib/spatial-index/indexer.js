import path from 'node:path'
import {setTimeout} from 'node:timers/promises'
import {finished} from 'node:stream/promises'
import {mkdir, rm, writeFile} from 'node:fs/promises'
import {Buffer} from 'node:buffer'
import {createGzip, createGunzip} from 'node:zlib'
import {createReadStream, createWriteStream} from 'node:fs'

import ndjson from 'ndjson'
import Flatbush from 'flatbush'
import bbox from '@turf/bbox'
import {pEvent} from 'p-event'

import {createInstance} from './lmdb.js'

export async function createIndexer(basePath, options = {}) {
  await mkdir(path.dirname(basePath), {recursive: true})

  const mdbPath = `${basePath}.mdb`
  const mdbLockPath = `${basePath}.mdb-lock`
  const rtreePath = `${basePath}.rtree`
  const bboxesTmpPath = `${basePath}-bboxes.tmp`

  await Promise.all([
    rm(mdbPath, {force: true}),
    rm(mdbLockPath, {force: true}),
    rm(rtreePath, {force: true}),
    rm(bboxesTmpPath, {force: true})
  ])

  const idKey = options.idKey || 'id'
  const {idFn} = options

  const {db, featuresDb, idIdxDb} = createInstance(mdbPath, options)

  let _idx = 0
  let _writing = 0
  let _written = 0

  async function slowDown() {
    if (_writing > 10_000) {
      await setTimeout(100)
      await slowDown()
    }
  }

  const bboxesWriteStream = createWriteStream(bboxesTmpPath)
  const bboxesStream = ndjson.stringify()
  bboxesStream.pipe(createGzip()).pipe(bboxesWriteStream)

  return {
    async writeFeatures(featuresIterator) {
      for await (const feature of featuresIterator) {
        const featureBbox = bbox(feature)
        if (!bboxesStream.write(featureBbox)) {
          await pEvent(bboxesStream, 'drain')
        }

        const id = idFn
          ? idFn(feature.properties)
          : feature.properties[idKey]

        if (!id) {
          throw new Error('Found feature without id')
        }

        const putFeaturePromise = featuresDb.put(_idx, feature)
        const putIdIdxPromise = idIdxDb.put(id, _idx)

        _writing++

        Promise.all([putFeaturePromise, putIdIdxPromise]).then(() => {
          _writing--
          _written++
        })

        slowDown()
        _idx++
      }

      await Promise.all([
        featuresDb.flushed,
        idIdxDb.flushed
      ])
    },

    async finish() {
      console.log(' * Fermeture de la base LMDB')

      await db.close()

      console.log(' * Finalisation de l’écriture du fichier temporaire des bboxes')

      bboxesStream.end()
      await finished(bboxesWriteStream)

      console.log(' * Construction du R-tree')

      const index = new Flatbush(_written)
      const bboxFile = createReadStream(bboxesTmpPath)

      const bboxStream = bboxFile
        .pipe(createGunzip())
        .pipe(ndjson.parse())

      for await (const bbox of bboxStream) {
        index.add(...bbox)
      }

      index.finish()

      console.log(' * Écriture du R-tree sur le disque')

      await writeFile(rtreePath, Buffer.from(index.data))

      console.log(' * Suppression du fichier temporaire')

      await rm(bboxesTmpPath)
    },

    get written() {
      return _written
    },

    get writing() {
      return _writing
    }
  }
}

