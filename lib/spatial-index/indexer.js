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
import {extractIntersectingTiles} from './util.js'

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

  const {db, featuresByIdxDb, featuresByIdDb, idIdxDb, tileIndexDb} = createInstance(mdbPath, options)

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
      const startedAt = Date.now()
      const initialCount = _written

      const writeFeaturesLoop = setInterval(() => {
        const written = _written - initialCount

        console.log({
          writing: _writing,
          written,
          writeBySec: written / (Date.now() - startedAt) * 1000
        })
      }, 2000)

      for await (const feature of featuresIterator) {
        const id = getId(feature.properties, options)

        if (!id) {
          throw new Error('Found feature without id')
        }

        const promises = []
        _writing++

        const shouldUseTileIndex = options.shouldUseTileIndexFn && options.shouldUseTileIndexFn(feature)

        if (shouldUseTileIndex) {
          const tiles = extractIntersectingTiles(feature.geometry)

          promises.push(
            featuresByIdDb.put(id, feature),
            Promise.all(tiles.map(tile => tileIndexDb.put(tile, id)))
          )
        } else {
          const featureBbox = bbox(feature)

          if (!bboxesStream.write(featureBbox)) {
            await pEvent(bboxesStream, 'drain')
          }

          promises.push(
            featuresByIdxDb.put(_idx, feature),
            idIdxDb.put(id, _idx)
          )

          _idx++
        }

        Promise.all(promises).then(() => {
          _writing--
          _written++
        })

        await slowDown()
      }

      await Promise.all([
        featuresByIdDb.flushed,
        featuresByIdxDb.flushed,
        idIdxDb.flushed,
        tileIndexDb.flushed
      ])

      clearInterval(writeFeaturesLoop)
    },

    async finish() {
      console.log(' * Fermeture de la base LMDB')

      await db.close()

      console.log(' * Finalisation de l’écriture du fichier temporaire des bboxes')

      bboxesStream.end()
      await finished(bboxesWriteStream)

      console.log(' * Construction du R-tree')

      const index = new Flatbush(_idx)
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

export function getId(obj, {idFn, idKey}) {
  if (idFn) {
    return idFn(obj)
  }

  if (idKey) {
    return obj[idKey]
  }

  return obj.id
}
