import test from 'ava'
import {formatResult, checkConfig, getById, search, reverse, asArray, structuredSearch} from '../search.js'

test('checkConfig / no db', t => {
  t.throws(() => checkConfig({db: 'database'}), {
    message: 'search must be called with db and rtreeIndex params'
  })
})

test('getById', t => {
  const options = {
    db: {
      getFeatureById() {
        return {
          type: 'Feature',
          properties: {
            lon: 12,
            lat: 8
          },
          geometry: {
            type: 'Point',
            coordinates: [12, 8]
          }
        }
      }
    },
    rtreeIndex: 'index',
    id: 1,
    center: [2, 4],
    returntruegeometry: true
  }

  const result = getById(options)

  t.deepEqual(result, {
    type: 'Feature',
    geometry: {type: 'Point', coordinates: [12, 8]},
    properties: {
      city: undefined,
      distance: 1_191_724,
      score: 0,
      truegeometry: {
        type: 'Point',
        coordinates: [12, 8]
      }
    }
  })
})

test('getById / no db', t => {
  t.throws(() => getById({options: null}), {
    message: 'db is required'
  })
})

test('asArray', t => {
  const newArray = asArray('coucou')
  const emptyArray = asArray()

  t.deepEqual(newArray, ['coucou'])
  t.deepEqual(emptyArray, [])
})

test('search / no limit', t => {
  const options = {
    rtreeIndex: 'index',
    db: 'database',
    center: [2, 3],
    returntruegeometry: true
  }

  t.throws(() => search(options), {
    message: 'limit is a required param'
  })
})

test('structuredSearch', t => {
  const options = {
    db: {
      getFeatureById() {
        return {
          type: 'Feature',
          properties: {
            lon: 12,
            lat: 8
          },
          geometry: {
            type: 'Point',
            coordinates: [12, 8]
          }
        }
      },
      idIdxDb: {
        getKeys() {
          return [
            121_010,
            101_212,
            281_182
          ]
        }
      }
    },
    limit: 1,
    filters: {
      departmentcode: 55,
      municipalitycode: 55_210,
      section: 6,
      number: 6
    },
    returntruegeometry: true
  }

  const result = structuredSearch(options)

  t.deepEqual(result,
    [
      {
        type: 'Feature',
        geometry: {type: 'Point', coordinates: [12, 8]},
        properties: {
          city: undefined,
          truegeometry: {
            type: 'Point',
            coordinates: [12, 8]
          }
        }
      }
    ]
  )
})

test('search / no center', t => {
  const options = {
    rtreeIndex: 'index',
    db: 'database',
    returntruegeometry: true,
    limit: 2
  }

  t.throws(() => search(options), {
    message: 'Parcel search requires filters or center'
  })
})

test('search / q', t => {
  const options = {
    db: {
      getFeatureById() {
        return {
          type: 'Feature',
          properties: {
            lon: 12,
            lat: 8
          },
          geometry: {
            type: 'Point',
            coordinates: [12, 8]
          }
        }
      }
    },
    q: 'oh !',
    rtreeIndex: {
      neighbors() {
        return 'ok'
      }
    },
    id: 1,
    center: [2, 4],
    limit: 1,
    filters: {un: 'filtre'},
    returntruegeometry: true
  }

  const result = search(options)

  t.truthy(result)
})

test('search / center', t => {
  const options = {
    db: {
      getFeatureById() {
        return {
          type: 'Feature',
          properties: {
            lon: 12,
            lat: 8
          },
          geometry: {
            type: 'Point',
            coordinates: [12, 8]
          }
        }
      }
    },
    rtreeIndex: {
      neighbors() {
        return 'ok'
      }
    },
    center: [2, 4],
    limit: 1,
    filters: {un: 'filtre'},
    returntruegeometry: true
  }

  const result = search(options)

  t.truthy(result)
})

test('search / filters', t => {
  const options = {
    db: {
      getFeatureById() {
        return {
          type: 'Feature',
          properties: {
            lon: 12,
            lat: 8
          },
          geometry: {
            type: 'Point',
            coordinates: [12, 8]
          }
        }
      },
      idIdxDb: {
        getKeys() {
          return [
            121_010,
            101_212,
            281_182
          ]
        }
      }
    },
    rtreeIndex: {
      neighbors() {
        return 'ok'
      }
    },
    limit: 1,
    filters: {
      departmentcode: 55,
      municipalitycode: 55_210
    },
    returntruegeometry: true
  }

  const result = search(options)

  t.truthy(result)
})

test('reverse / no db', t => {
  t.throws(() => reverse({options: 'sans'}), {
    message: 'db is required'
  })
})

test('reverse', t => {
  const result = reverse({
    db: 'database',
    rtreeIndex: 'index',
    limit: 1,
    center: [2, 3]
  })

  t.truthy(result)
})

test('formatResult', t => {
  const feature = {
    properties: {
      lon: 12,
      lat: 8
    }
  }

  const formatedResult = formatResult(feature, {distanceCache: 8})

  t.deepEqual(formatedResult, {
    type: 'Feature',
    geometry: {type: 'Point', coordinates: [12, 8]},
    properties: {city: undefined, distance: 8, score: 0.9992}
  })
})

test('formatResult / center', t => {
  const center = [9, 4]
  const feature = {
    properties: {
      lon: 12,
      lat: 8
    }
  }

  const formatedResult = formatResult(feature, {center})

  t.deepEqual(formatedResult, {
    type: 'Feature',
    geometry: {type: 'Point', coordinates: [12, 8]},
    properties: {city: undefined, distance: 554_839, score: 0}
  })
})

test('formatResult / returntruegeometry', t => {
  const center = [9, 4]
  const feature = {
    properties: {
      lon: 12,
      lat: 8
    },
    geometry: {
      type: 'Point',
      coordinates: [12, 8]
    }
  }

  const formatedResult = formatResult(feature, {center, returntruegeometry: true})

  t.deepEqual(formatedResult, {
    type: 'Feature',
    geometry: {type: 'Point', coordinates: [12, 8]},
    properties: {
      city: undefined,
      distance: 554_839,
      score: 0,
      truegeometry: {
        type: 'Point',
        coordinates: [12, 8]
      }
    }
  })
})

