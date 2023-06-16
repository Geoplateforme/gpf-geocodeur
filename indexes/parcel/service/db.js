import LMDB from 'lmdb'
import Pbf from 'pbf'
import geobuf from 'geobuf'

import {PARCEL_INDEX_MDB_PATH} from '../util/paths.js'

export async function createDatabase() {
  const env = LMDB.open(PARCEL_INDEX_MDB_PATH, {readOnly: true})
  const featuresDb = env.openDB('features', {keyEncoding: 'uint32', encoding: 'binary'})
  const idxIdDb = env.openDB('idx-id')

  function getFeatureByIdx(idx) {
    const buffer = featuresDb.get(idx)

    if (!buffer) {
      throw new Error(`No matching feature for idx ${idx}`)
    }

    return geobuf.decode(new Pbf(buffer))
  }

  function getFeatureById(id) {
    const idx = idxIdDb.get(id)

    if (idx !== undefined) {
      return getFeatureByIdx(idx)
    }
  }

  function close() {
    env.close()
  }

  return {
    getFeatureByIdx,
    getFeatureById,
    close
  }
}
