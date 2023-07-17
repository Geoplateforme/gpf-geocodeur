import test from 'ava'
import {computeFulltext, formatAutocompleteParams, formatResult, getCenterFromCoordinates} from '../autocomplete.js'

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
    indexes: ['address', 'poi'],
    limit: 10
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
    limit: 5,
    lon: 2,
    lat: 40
  })
})

test('formatAutocompleteParams / with poiType', t => {
  const params = {
    text: 'search text',
    type: ['PositionOfInterest'],
    poiType: ['administratif, sommet'],
    maximumResponses: 5,
    lonlat: [2, 40]
  }

  const result = formatAutocompleteParams(params)

  t.deepEqual(result, {
    q: 'search text',
    autocomplete: true,
    indexes: ['poi'],
    category: ['administratif, sommet'],
    limit: 5,
    lon: 2,
    lat: 40
  })
})

test('formatResult', t => {
  const result = {
    address: [
      {
        properties: {
          city: 'City A',
          oldcity: 'Old City A',
          postcode: '12345',
          street: 'Street1',
          citycode: '97001',
          name: 'Location1',
          score: 0.9
        },
        geometry: {
          coordinates: [12.34, 56.78]
        }
      },
      {
        properties: {
          city: 'City B',
          oldcity: 'Old City B',
          postcode: '12346',
          street: 'Street2',
          citycode: '97001',
          name: 'Location2',
          score: 0.8
        },
        geometry: {
          coordinates: [2, 40]
        }
      }
    ],
    poi: [
      {
        properties: {
          name: 'POI1',
          city: 'City B',
          postcode: ['97124'],
          citycode: '97123',
          category: 'administratif',
          toponym: 'Admin1',
          classification: 5,
          score: 0.8
        },
        geometry: {
          coordinates: [98.76, 54.32]
        }
      },
      {
        properties: {
          name: 'POI2',
          city: 'City C',
          postcode: ['97125'],
          citycode: '97122',
          category: 'administratif',
          toponym: 'Admin1',
          classification: 5,
          score: 0.9
        },
        geometry: {
          coordinates: [3, 35]
        }
      }
    ]
  }

  const formattedResult = formatResult(result)

  t.deepEqual(formattedResult, {
    address: [
      {
        properties: {
          country: 'StreetAddress',
          city: 'City A',
          oldcity: 'Old City A',
          zipcode: '12345',
          street: 'Street1',
          metropole: false,
          fulltext: 'Location1, 12345 City A',
          x: 12.34,
          y: 56.78,
          classification: 7,
          score: 0.9
        }
      },
      {
        properties: {
          country: 'StreetAddress',
          city: 'City B',
          oldcity: 'Old City B',
          zipcode: '12346',
          street: 'Street2',
          metropole: false,
          fulltext: 'Location2, 12346 City B',
          x: 2,
          y: 40,
          classification: 7,
          score: 0.8
        }
      }
    ],
    poi: [
      {
        properties: {
          country: 'PositionOfInterest',
          names: 'POI1',
          city: 'City B',
          zipcode: '97124',
          zipcodes: ['97124'],
          metropole: false,
          poiType: 'administratif',
          street: 'City B',
          kind: 'Admin1',
          fulltext: 'POI1, 97124 City B',
          x: 98.76,
          y: 54.32,
          classification: 5,
          score: 0.8
        }
      },
      {
        properties: {
          country: 'PositionOfInterest',
          names: 'POI2',
          city: 'City C',
          zipcode: '97125',
          zipcodes: ['97125'],
          metropole: false,
          poiType: 'administratif',
          street: 'City C',
          kind: 'Admin1',
          fulltext: 'POI2, 97125 City C',
          x: 3,
          y: 35,
          classification: 5,
          score: 0.9
        }
      }
    ]
  })
})

test('computeFulltext', t => {
  t.is(computeFulltext({name: 'Location A'}), 'Location A')
  t.is(computeFulltext({name: 'Location B', postcode: '12345'}), 'Location B, 12345')
  t.is(computeFulltext({name: 'Location C', city: 'City A'}), 'Location C, City A')
  t.is(computeFulltext({name: 'Location D', postcode: '12345', city: 'City B'}), 'Location D, 12345 City B')
})
