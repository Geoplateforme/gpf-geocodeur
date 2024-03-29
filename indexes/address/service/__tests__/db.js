import test from 'ava'
import {pickValues, prepareHousenumber, prepareMunicipality, prepareStreet} from '../db.js'

test('prepareHousenumber', t => {
  const hnFeature = {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [1, 1]
    },
    properties: {
      housenumber: '123',
      id: '123456789',
      x: 12,
      y: 6,
      foo: 'bar'
    }
  }

  const streetFeature = {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [2, 2]
    },
    properties: {
      name: 'Rue Principale',
      postcode: '12345',
      city: 'Ville',
      foo: 'bar'
    }
  }

  const result = prepareHousenumber(hnFeature, streetFeature)

  t.deepEqual(result, {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [1, 1]
    },
    properties: {
      type: 'housenumber',
      id: '123456789',
      x: 12,
      y: 6,
      housenumber: '123',
      name: '123 Rue Principale',
      label: '123 Rue Principale 12345 Ville',
      street: 'Rue Principale',
      postcode: '12345',
      city: 'Ville'
    }
  })
})

test('prepareMunicipality', t => {
  const feature = {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [2, 40]
    },
    properties: {
      id: '123456789',
      name: 'Ville',
      x: 12,
      y: 6,
      citycode: '12345',
      postcode: '12345',
      city: 'Ville',
      foo: 'bar'
    }
  }

  const result = prepareMunicipality(feature)

  t.deepEqual(result, {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [2, 40]
    },
    properties: {
      type: 'municipality',
      name: 'Ville',
      id: '123456789',
      x: 12,
      y: 6,
      citycode: '12345',
      postcode: '12345',
      city: 'Ville',
      label: '12345 Ville'
    }
  })
})

test('prepareStreet', t => {
  const feature = {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [2, 2]
    },
    properties: {
      type: 'street',
      id: '123456789',
      x: 12,
      y: 6,
      citycode: '12345',
      name: 'Rue Principale',
      postcode: '12345',
      city: 'Ville',
      foo: 'bar'
    }
  }

  const result = prepareStreet(feature)

  t.deepEqual(result, {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [2, 2]
    },
    properties: {
      type: 'street',
      id: '123456789',
      x: 12,
      y: 6,
      citycode: '12345',
      name: 'Rue Principale',
      postcode: '12345',
      city: 'Ville',
      label: 'Rue Principale 12345 Ville'
    }
  })
})

test('pickValues', t => {
  const item = {
    foo1: 'bar1',
    foo2: 'bar2',
    foo3: ['bar3', 'bar4']
  }

  const values = ['foo4', 'foo1', 'foo2', 'foo3']
  const result = pickValues(item, values)

  t.deepEqual(result, {
    foo1: 'bar1',
    foo2: 'bar2',
    foo3: 'bar3'
  })
})
