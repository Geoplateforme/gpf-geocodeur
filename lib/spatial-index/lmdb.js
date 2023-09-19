import LMDB from 'lmdb'
import geobuf from 'geobuf'
import Pbf from 'pbf'
import {unpack, pack} from 'msgpackr'
import {chain} from 'lodash-es'

export function createInstance(mdbPath, options = {}) {
  const db = LMDB.open(mdbPath, {readOnly: options.readOnly})

  const featuresByIdxDbOptions = {
    keyEncoding: 'uint32',
    encoder: options.geometryType === 'Point' ? ENCODERS.point : ENCODERS.geobuf,
    cache: options.cache
  }

  const featuresByIdDbOptions = {
    encoder: options.geometryType === 'Point' ? ENCODERS.point : ENCODERS.geobuf,
    cache: options.cache
  }

  const featuresByIdxDb = db.openDB('features-by-idx', featuresByIdxDbOptions)
  const featuresByIdDb = db.openDB('features-by-id', featuresByIdDbOptions)
  const idIdxDb = db.openDB('id-idx', {cache: options.cache})
  const tileIndexDb = db.openDB('tile-index', {encoding: 'ordered-binary', dupSort: true})

  function getFeatureByIdx(idx) {
    const item = featuresByIdxDb.get(idx)

    if (!item) {
      throw new Error(`No matching feature for idx ${idx}`)
    }

    return item
  }

  function getFeatureById(id) {
    const feature = featuresByIdDb.get(id)

    if (feature) {
      return feature
    }

    const idx = idIdxDb.get(id)

    if (idx !== undefined) {
      return getFeatureByIdx(idx)
    }
  }

  function getFeaturesByTiles(tiles) {
    return chain(tiles)
      .map(tile => [...tileIndexDb.getValues(tile)])
      .flatten()
      .uniq()
      .map(id => getFeatureById(id))
      .value()
  }

  return {
    db,
    featuresByIdxDb,
    featuresByIdDb,
    idIdxDb,
    tileIndexDb,
    getFeatureByIdx,
    getFeatureById,
    getFeaturesByTiles
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
