import LMDB from 'lmdb'
import geobuf from 'geobuf'
import Pbf from 'pbf'
import {unpack, pack} from 'msgpackr'

export function createInstance(mdbPath, options = {}) {
  const db = LMDB.open(mdbPath, {readOnly: options.readOnly})

  const featuresDbOptions = {
    keyEncoding: 'uint32',
    encoder: options.geometryType === 'Point' ? ENCODERS.point : ENCODERS.geobuf,
    cache: options.cache
  }

  const featuresDb = db.openDB('features', featuresDbOptions)
  const idIdxDb = db.openDB('id-idx', {cache: options.cache})

  function getFeatureByIdx(idx) {
    const item = featuresDb.get(idx)

    if (!item) {
      throw new Error(`No matching feature for idx ${idx}`)
    }

    return item
  }

  function getFeatureById(id) {
    const idx = idIdxDb.get(id)

    if (idx !== undefined) {
      return getFeatureByIdx(idx)
    }
  }

  return {
    db,
    featuresDb,
    idIdxDb,
    getFeatureByIdx,
    getFeatureById
  }
}

export const ENCODERS = {
  geobuf: {
    encode(feature) {
      if (feature.type !== 'Feature') {
        throw new Error('Unexpected object: geobuf can only encode Feature')
      }

      return geobuf.encode(feature, new Pbf())
    },

    decode(buffer) {
      return geobuf.decode(new Pbf(buffer))
    }
  },

  point: {
    encode(feature) {
      if (feature.type !== 'Feature') {
        throw new Error('Unexpected object: point can only encode Feature')
      }

      if (feature.geometry.type !== 'Point') {
        throw new Error('Unexpected object: point can only encode Point')
      }

      return pack({...feature.properties, _point: feature.geometry.coordinates})
    },

    decode(buffer) {
      const obj = unpack(buffer)

      const geometry = {type: 'Point', coordinates: obj._point}
      delete obj._point

      return {
        type: 'Feature',
        properties: obj,
        geometry
      }
    }
  }
}
