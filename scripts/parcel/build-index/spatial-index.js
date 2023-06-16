import {setTimeout} from 'node:timers/promises'
import {finished} from 'node:stream/promises'
import {rm, writeFile} from 'node:fs/promises'
import {Buffer} from 'node:buffer'
import {createGzip, createGunzip} from 'node:zlib'
import {createReadStream, createWriteStream} from 'node:fs'
import ndjson from 'ndjson'
import geobuf from 'geobuf'
import Pbf from 'pbf'
import Flatbush from 'flatbush'
import bbox from '@turf/bbox'
import LMDB from 'lmdb'
import {pEvent} from 'p-event'

export async function createSpatialIndexBuilder(dbPrefix) {
  const mdbPath = `${dbPrefix}.mdb`
  const lockPath = `${dbPrefix}.mdb-lock`
  const rtreePath = `${dbPrefix}.rtree`
  const bboxTmpPath = `${dbPrefix}-bboxes.tmp`

  await Promise.all([
    rm(mdbPath, {force: true}),
    rm(lockPath, {force: true}),
    rm(rtreePath, {force: true}),
    rm(bboxTmpPath, {force: true})
  ])

  const db = LMDB.open(mdbPath)
  const featuresDb = db.openDB('features', {keyEncoding: 'uint32', encoding: 'binary'})
  const idxIdDb = db.openDB('idx-id')

  let _idx = 0
  let _writing = 0
  let _written = 0

  async function slowDown() {
    if (_writing > 10_000) {
      await setTimeout(100)
      await slowDown()
    }
  }

  const bboxesWriteStream = createWriteStream(bboxTmpPath)
  const bboxesStream = ndjson.stringify()
  bboxesStream.pipe(createGzip()).pipe(bboxesWriteStream)

  return {
    async writeFeatures(featuresIterator) {
      for await (const feature of featuresIterator) {
        const featureBbox = bbox(feature)
        if (!bboxesStream.write(featureBbox)) {
          await pEvent(bboxesStream, 'drain')
        }

        const featureId = feature.properties.id

        const buffer = geobuf.encode(feature, new Pbf())
        const putFeaturePromise = featuresDb.put(_idx, buffer)
        const putIdxIdPromise = idxIdDb.put(featureId, _idx)

        _writing++

        Promise.all([putFeaturePromise, putIdxIdPromise]).then(() => {
          _writing--
          _written++
        })

        slowDown()
        _idx++
      }

      await Promise.all([
        featuresDb.flushed,
        idxIdDb.flushed
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
      const bboxFile = createReadStream(bboxTmpPath)

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

      await rm(bboxTmpPath)
    },

    get written() {
      return _written
    },

    get writing() {
      return _writing
    }
  }
}
