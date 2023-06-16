import LMDB from 'lmdb'
import {omit} from 'lodash-es'

import {ADDRESS_INDEX_MDB_PATH} from '../util/paths.js'

export async function createDatabase() {
  const env = LMDB.open(ADDRESS_INDEX_MDB_PATH, {readOnly: true})
  const itemsDb = env.openDB('items', {keyEncoding: 'uint32', cache: true})
  const idIdxDb = env.openDB('id-idx', {cache: true})

  function getItemByIdx(idx) {
    const item = itemsDb.get(idx)

    if (!item) {
      throw new Error(`No matching item for idx ${idx}`)
    }

    return item
  }

  function getItemById(id) {
    const idx = idIdxDb.get(id)

    if (idx !== undefined) {
      return getItemByIdx(idx)
    }
  }

  function getFeatureByIdx(idx) {
    let item = getItemByIdx(idx)

    if (item.type === 'housenumber') {
      const street = getItemById(item.street)

      if (!street) {
        throw new Error(`No matching street for id ${item.street}`)
      }

      item = prepareHousenumber(item, street)
    } else if (item.type === 'municipality') {
      item = prepareMunicipality(item)
    } else {
      // Type 'street' or 'locality'
      item = prepareStreet(item)
    }

    return {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [item.lon, item.lat]
      },
      properties: omit(item, ['lon', 'lat'])
    }
  }

  function close() {
    env.close()
  }

  return {
    getFeatureByIdx,
    getItemByIdx,
    getItemById,
    close
  }
}

const STREET_FIELDS = [
  'name',
  'postcode',
  'citycode',
  'city',
  'oldcitycode',
  'oldcity',
  'district',
  'context',
  'importance',
  'id',
  'lon',
  'lat',
  'x',
  'y'
]

const MUNICIPALITY_FIELDS = [
  'name',
  'postcode',
  'citycode',
  'city',
  'population',
  'context',
  'importance',
  'id',
  'lon',
  'lat',
  'x',
  'y'
]

const HN_STREET_FIELDS = [
  'postcode',
  'citycode',
  'city',
  'oldcitycode',
  'oldcity',
  'district',
  'context',
  'importance'
]

const HN_FIELDS = [
  'housenumber',
  'id',
  'lon',
  'lat',
  'x',
  'y'
]

function prepareHousenumber(hnEntry, streetEntry) {
  const streetValues = pickValues(streetEntry, HN_STREET_FIELDS)
  const hnValues = pickValues(hnEntry, HN_FIELDS)

  return {
    type: 'housenumber',
    name: `${hnEntry.housenumber} ${streetEntry.name}`,
    label: `${hnEntry.housenumber} ${streetEntry.name} ${streetValues.postcode} ${streetValues.city}`,
    street: streetEntry.name,
    ...streetValues,
    ...hnValues
  }
}

function prepareMunicipality(entry) {
  const values = pickValues(entry, MUNICIPALITY_FIELDS)

  return {
    type: 'municipality',
    ...values,
    label: `${values.postcode} ${values.city}`
  }
}

function prepareStreet(entry) {
  const values = pickValues(entry, STREET_FIELDS)

  return {
    type: entry.type,
    ...values,
    label: `${values.name} ${values.postcode} ${values.city}`
  }
}

function pickValues(item, values) {
  const result = {}

  for (const key of values) {
    if (item[key] === undefined) {
      continue
    }

    result[key] = Array.isArray(item[key])
      ? item[key][0]
      : item[key]
  }

  return result
}
