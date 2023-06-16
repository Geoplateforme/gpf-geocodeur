import path from 'node:path'
import {setTimeout} from 'node:timers/promises'
import {finished} from 'node:stream/promises'
import {rm, writeFile} from 'node:fs/promises'
import {Buffer} from 'node:buffer'
import {createGzip, createGunzip} from 'node:zlib'
import {createReadStream, createWriteStream} from 'node:fs'
import ndjson from 'ndjson'
import Flatbush from 'flatbush'
import LMDB from 'lmdb'
import {pEvent} from 'p-event'

import {ADDRESS_INDEX_RTREE_PATH, ADDRESS_INDEX_MDB_PATH, ADDRESS_INDEX_PATH} from '../../util/paths.js'

const ADDRESS_INDEX_BBOXES_TMP_PATH = path.join(ADDRESS_INDEX_PATH, 'address-bboxes.tmp')

export async function createSpatialIndexBuilder() {
  await Promise.all([
    rm(ADDRESS_INDEX_MDB_PATH, {force: true}),
    rm(ADDRESS_INDEX_MDB_PATH + '-lock', {force: true}),
    rm(ADDRESS_INDEX_RTREE_PATH, {force: true}),
    rm(ADDRESS_INDEX_BBOXES_TMP_PATH, {force: true})
  ])

  const db = LMDB.open(ADDRESS_INDEX_MDB_PATH)
  const itemsDb = db.openDB('items', {keyEncoding: 'uint32'})
  const idIdxDb = db.openDB('id-idx')

  let _idx = 0
  let _writing = 0
  let _written = 0

  async function slowDown() {
    if (_writing > 10_000) {
      await setTimeout(100)
      await slowDown()
    }
  }

  const bboxesWriteStream = createWriteStream(ADDRESS_INDEX_BBOXES_TMP_PATH)
  const bboxesStream = ndjson.stringify()
  bboxesStream.pipe(createGzip()).pipe(bboxesWriteStream)

  return {
    async writeItems(itemsIterator) {
      for await (const item of itemsIterator) {
        const featureBbox = [item.lon, item.lat, item.lon, item.lat]
        if (!bboxesStream.write(featureBbox)) {
          await pEvent(bboxesStream, 'drain')
        }

        const putIdIdxPromise = idIdxDb.put(item.id, _idx)
        const putItemPromise = itemsDb.put(_idx, item)

        _writing++

        Promise.all([putIdIdxPromise, putItemPromise]).then(() => {
          _writing--
          _written++
        })

        slowDown()
        _idx++
      }

      await itemsDb.flushed
      await idIdxDb.flushed
    },

    async finish() {
      console.log(' * Fermeture de la base LMDB')

      await db.close()

      console.log(' * Finalisation de l’écriture du fichier temporaire des bboxes')

      bboxesStream.end()
      await finished(bboxesWriteStream)

      console.log(' * Construction du R-tree')

      const index = new Flatbush(_written)
      const bboxFile = createReadStream(ADDRESS_INDEX_BBOXES_TMP_PATH)

      const bboxStream = bboxFile
        .pipe(createGunzip())
        .pipe(ndjson.parse())

      for await (const bbox of bboxStream) {
        index.add(...bbox)
      }

      index.finish()

      console.log(' * Écriture du R-tree sur le disque')

      await writeFile(ADDRESS_INDEX_RTREE_PATH, Buffer.from(index.data))

      console.log(' * Suppression du fichier temporaire')

      await rm(ADDRESS_INDEX_BBOXES_TMP_PATH)
    },

    get written() {
      return _written
    },

    get writing() {
      return _writing
    }
  }
}
