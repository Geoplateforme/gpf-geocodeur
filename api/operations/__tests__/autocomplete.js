import test from 'ava'
import {computeFulltext, computePoiCity, formatAutocompleteParams, formatResult, getCenterFromCoordinates, computeRetainedLimit, postFilterBbox, postFilterTerr, computeDepCodeFromCityCode, computeTerritoryFromDepCode, ensureArray} from '../autocomplete.js'

test('getCenterFromCoordinates', t => {
  t.is(getCenterFromCoordinates({}), undefined)
  t.deepEqual(getCenterFromCoordinates({lonlat: [2, 45]}), {lon: 2, lat: 45})
  t.deepEqual(getCenterFromCoordinates({bbox: [1, -66, 2, -66], lonlat: [2, 45]}), {lon: 2, lat: 45})
  t.deepEqual(getCenterFromCoordinates({bbox: [1, -66, 2, -66]}), {lon: 1.5, lat: -66})
})

test('formatAutocompleteParams', t => {
  const params = {
    text: 'search text',
    type: ['StreetAddress', 'PositionOfInterest'],
    maximumResponses: 10
  }

  const result = formatAutocompleteParams(params)

  t.deepEqual(result, {
    q: 'search text',
    autocomplete: true,
    indexes: ['address', 'poi']
  })
})

test('formatAutocompleteParams / with coordinates', t => {
  const params = {
    text: 'search text',
    type: ['PositionOfInterest'],
    maximumResponses: 5,
    lonlat: [2, 40]
  }

  const result = formatAutocompleteParams(params)

  t.deepEqual(result, {
    q: 'search text',
    autocomplete: true,
    indexes: ['poi'],
    lon: 2,
    lat: 40
  })
})

test('formatAutocompleteParams / with poiType', t => {
  const params = {
    text: 'search text',
    type: ['PositionOfInterest'],
    poiType: 'administratif',
    maximumResponses: 5,
    lonlat: [2, 40]
  }

  const result = formatAutocompleteParams(params)

  t.deepEqual(result, {
    q: 'search text',
    autocomplete: true,
    indexes: ['poi'],
    category: 'administratif',
    lon: 2,
    lat: 40
  })
})

test('formatResult / address 1', t => {
  t.deepEqual(formatResult({
    properties: {
      city: 'City A',
      oldcity: 'Old City A',
      postcode: '12345',
      street: 'Street1',
      citycode: '97001',
      score: 0.9,
      _type: 'address'
    },
    geometry: {
      coordinates: [12.34, 56.78]
    }
  }), {
    country: 'StreetAddress',
    city: 'City A',
    oldcity: 'Old City A',
    zipcode: '12345',
    street: 'Street1',
    metropole: false,
    fulltext: 'Street1, 12345 City A',
    kind: '',
    x: 12.34,
    y: 56.78,
    classification: 7
  })
})

test('formatResult / address 2', t => {
  t.deepEqual(formatResult({
    properties: {
      city: 'City B',
      oldcity: 'Old City B',
      postcode: '12346',
      street: 'Street2',
      citycode: '97001',
      score: 0.8,
      _type: 'address'
    },
    geometry: {
      coordinates: [2, 40]
    }
  }), {
    country: 'StreetAddress',
    city: 'City B',
    oldcity: 'Old City B',
    zipcode: '12346',
    street: 'Street2',
    metropole: false,
    fulltext: 'Street2, 12346 City B',
    kind: '',
    x: 2,
    y: 40,
    classification: 7
  })
})

test('formatResult / poi 1', t => {
  t.deepEqual(formatResult({
    properties: {
      name: ['POI1'],
      city: ['City B'],
      postcode: ['97124'],
      citycode: '97123',
      category: ['administratif'],
      toponym: 'Admin1',
      classification: 5,
      score: 0.8,
      _type: 'poi'
    },
    geometry: {
      coordinates: [98.76, 54.32]
    }
  }), {
    country: 'PositionOfInterest',
    names: ['POI1'],
    city: 'City B',
    zipcode: '97124',
    zipcodes: ['97124'],
    metropole: false,
    poiType: ['administratif'],
    street: 'City B',
    kind: 'administratif',
    fulltext: 'POI1, 97124 City B',
    x: 98.76,
    y: 54.32,
    classification: 5
  })
})

test('formatResult / poi 2', t => {
  t.deepEqual(formatResult({
    properties: {
      name: ['POI2'],
      city: ['City C'],
      postcode: ['97125'],
      citycode: '97122',
      category: ['administratif'],
      toponym: 'Admin1',
      classification: 5,
      score: 0.9,
      _type: 'poi'
    },
    geometry: {
      coordinates: [3, 35]
    }
  }), {
    country: 'PositionOfInterest',
    names: ['POI2'],
    city: 'City C',
    zipcode: '97125',
    zipcodes: ['97125'],
    metropole: false,
    poiType: ['administratif'],
    street: 'City C',
    kind: 'administratif',
    fulltext: 'POI2, 97125 City C',
    x: 3,
    y: 35,
    classification: 5
  })
})

test('computePoiCity', t => {
  t.is(computePoiCity(['City A']), 'City A')
  t.is(computePoiCity(['City B', 'City C']), 'City B')
  t.is(computePoiCity([]), undefined)
  t.is(computePoiCity(null), undefined)
  t.is(computePoiCity(undefined), undefined)
})

test('computeFulltext', t => {
  t.is(computeFulltext({name: ['Location A']}), 'Location A')
  t.is(computeFulltext({name: ['Location B'], postcode: '12345'}), 'Location B, 12345')
  t.is(computeFulltext({name: ['Location C'], city: 'City A'}), 'Location C, City A')
  t.is(computeFulltext({name: ['Location D'], postcode: '12345', city: 'City B'}), 'Location D, 12345 City B')
  t.is(computeFulltext({name: ['Location E', 'Location F'], postcode: ['12345', '654321'], city: 'City B'}), 'Location E, 12345 City B')
  t.is(computeFulltext({name: ['Location G']}), 'Location G')
  t.is(computeFulltext({street: 'Location H', city: 'City A'}), 'Location H, City A')
  t.is(computeFulltext({street: 'Location I', postcode: '12345', city: 'City B'}), 'Location I, 12345 City B')
  t.is(computeFulltext({street: 'Location J', postcode: '12345'}), 'Location J, 12345')
  t.is(computeFulltext({name: ['Location K'], street: 'Location L', postcode: '12345'}), 'Location K, 12345')
  t.is(computeFulltext({name: 'Location M', street: 'Location L', postcode: '12345'}), 'Location M, 12345')
})

test('computeRetainedLimit', t => {
  t.is(computeRetainedLimit(10, false), 10)
  t.is(computeRetainedLimit(10, true), 40)
  t.is(computeRetainedLimit(20, true), 50)
})

test('postFilterBbox', t => {
  const feature = {
    type: 'Feature',
    properties: {},
    geometry: {
      coordinates: [
        5.385_525,
        49.162_236
      ],
      type: 'Point'
    }
  }

  t.true(postFilterBbox(feature, [5.360_607, 49.148_59, 5.413_11, 49.179_495]))
  t.false(postFilterBbox(feature, [5.157_097, 49.126_923, 5.227_785, 49.163_65]))
})

test('postFilterTerr / territory = METROPOLE', t => {
  const result = {
    properties: {territory: 'METROPOLE'}
  }

  t.true(postFilterTerr(result, new Set(['METROPOLE'])))
  t.false(postFilterTerr(result, new Set(['DOMTOM'])))
  t.false(postFilterTerr(result, new Set(['12345'])))
})

test('postFilterTerr / territory = METROPOLE (infered)', t => {
  const result = {
    properties: {citycode: ['12345']}
  }

  t.true(postFilterTerr(result, new Set(['METROPOLE'])))
  t.false(postFilterTerr(result, new Set(['DOMTOM'])))
  t.false(postFilterTerr(result, new Set(['12345'])))
})

test('postFilterTerr / territory = DOMTOM', t => {
  const result = {
    properties: {territory: 'DOMTOM'}
  }

  t.false(postFilterTerr(result, new Set(['METROPOLE'])))
  t.true(postFilterTerr(result, new Set(['DOMTOM'])))
  t.false(postFilterTerr(result, new Set(['12345'])))
})

test('postFilterTerr / territory = DOMTOM (infered)', t => {
  const result = {
    properties: {citycode: ['97123']}
  }

  t.false(postFilterTerr(result, new Set(['METROPOLE'])))
  t.true(postFilterTerr(result, new Set(['DOMTOM'])))
  t.false(postFilterTerr(result, new Set(['12345'])))
})

test('postFilterTerr / depcode (from citycode)', t => {
  const result = {
    properties: {citycode: ['971']}
  }

  t.true(postFilterTerr(result, new Set(['971'])))
  t.false(postFilterTerr(result, new Set(['12'])))
  t.false(postFilterTerr(result, new Set(['974'])))
})

test('postFilterTerr / depcode (infered from citycode)', t => {
  const result = {
    properties: {citycode: ['97123']}
  }

  t.true(postFilterTerr(result, new Set(['971'])))
  t.false(postFilterTerr(result, new Set(['12'])))
  t.false(postFilterTerr(result, new Set(['974'])))
})

test('postFilterTerr / postcode', t => {
  const result = {
    properties: {postcode: ['12340']}
  }

  t.true(postFilterTerr(result, new Set(['12340'])))
  t.false(postFilterTerr(result, new Set(['54000'])))
  t.false(postFilterTerr(result, new Set(['67090'])))
})

test('postFilterTerr / mixed', t => {
  const result = {
    properties: {postcode: ['12340'], citycode: ['54', '57011'], territory: 'METROPOLE'}
  }

  t.true(postFilterTerr(result, new Set(['12340'])))
  t.true(postFilterTerr(result, new Set(['54'])))
  t.true(postFilterTerr(result, new Set(['57'])))
  t.true(postFilterTerr(result, new Set(['METROPOLE'])))
  t.false(postFilterTerr(result, new Set(['57011'])))
})

test('computeDepCodeFromCityCode', t => {
  t.deepEqual(
    computeDepCodeFromCityCode(['12345', '12345', '97123', '57', '57123']).sort(),
    ['12', '57', '971']
  )

  t.deepEqual(computeDepCodeFromCityCode(null), [])
})

test('computeTerritoryFromDepCode', t => {
  t.is(computeTerritoryFromDepCode(undefined), undefined)
  t.is(computeTerritoryFromDepCode([]), undefined)
  t.is(computeTerritoryFromDepCode(['12']), 'METROPOLE')
  t.is(computeTerritoryFromDepCode(['974']), 'DOMTOM')
})

test('ensureArray', t => {
  t.deepEqual(ensureArray(), [])
  t.deepEqual(ensureArray(null), [])
  t.deepEqual(ensureArray('a'), ['a'])
  t.deepEqual(ensureArray(['a', 'b']), ['a', 'b'])
})
