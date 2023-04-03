import test from 'ava'
import validateParams, {isFirstCharValid, validateQ, extractParams, extractParam, PARAMS} from '../lib/validate-params.js'

test('isFirstCharValid', t => {
  t.false(isFirstCharValid('---'))
  t.true(isFirstCharValid('A--'))
  t.true(isFirstCharValid('1--'))
  t.true(isFirstCharValid('é--'))
  t.true(isFirstCharValid('É--'))
})

test('validateQ', t => {
  const qMaxLength = 200

  t.is(validateQ('foo'), 'foo')
  t.is(validateQ(' foo'), 'foo')

  const errorA = t.throws(() => validateQ(null), {message: 'Parse query failed'})
  t.deepEqual(errorA.detail, ['Error: Missing [q] parameter'])

  const errorB = t.throws(() => validateQ(1), {message: 'Parse query failed'})
  t.deepEqual(errorB.detail, ['Error: Parameter [q] must be a string'])

  const errorC = t.throws(() => validateQ(''), {message: 'Parse query failed'})
  t.deepEqual(errorC.detail, ['Error: Missing [q] parameter'])

  const errorD = t.throws(() => validateQ('a'), {message: 'Parse query failed'})
  t.deepEqual(errorD.detail, [`Error: Parameter [q] must contain between 3 and ${qMaxLength} chars and start with a number or a letter`])

  const errorE = t.throws(() => validateQ('aa'), {message: 'Parse query failed'})
  t.deepEqual(errorE.detail, [`Error: Parameter [q] must contain between 3 and ${qMaxLength} chars and start with a number or a letter`])

  const errorF = t.throws(() => validateQ('-aaa'), {message: 'Parse query failed'})
  t.deepEqual(errorF.detail, [`Error: Parameter [q] must contain between 3 and ${qMaxLength} chars and start with a number or a letter`])
})

test('extractParam / limit', t => {
  function validateLimit(limit) {
    return extractParam({limit}, 'limit', PARAMS.limit)
  }

  t.is(validateLimit('1'), 1)
  t.is(validateLimit('5'), 5)
  t.is(validateLimit('20'), 20)
  t.is(validateLimit(''), 5)

  for (const limit of ['0', '-1', '101']) {
    t.throws(() => validateLimit(limit), {message: 'Param limit must be an integer between 1 and 20'})
  }

  for (const limit of ['0.5', 'foo']) {
    t.throws(() => validateLimit(limit), {message: 'Unable to parse value as integer'})
  }
})

test('extractParam / indexes', t => {
  function extractIndexes(index) {
    return extractParam({index}, 'indexes', PARAMS.indexes)
  }

  t.deepEqual(extractIndexes('address'), ['address'])
  t.deepEqual(extractIndexes('address,poi'), ['address', 'poi'])
  t.deepEqual(extractIndexes('address,poi,poi'), ['address', 'poi']) // Dedupe
  t.deepEqual(extractIndexes('address,poi,parcel'), ['address', 'poi', 'parcel'])
  t.deepEqual(extractIndexes(''), ['address'])
  t.deepEqual(extractIndexes(), ['address'])

  t.throws(() => extractIndexes('foo,bar'), {message: 'Unexpected value \'foo\' for param indexes'})
  t.throws(() => extractIndexes('address,foo'), {message: 'Unexpected value \'foo\' for param indexes'})
})

test('extractParam / lon-lat', t => {
  function extractLon(lon) {
    return extractParam({lon}, 'lon', PARAMS.lon)
  }

  function extractLat(lat) {
    return extractParam({lat}, 'lat', PARAMS.lat)
  }

  t.is(extractLat('1'), 1)
  t.is(extractLat('1.1'), 1.1)
  t.is(extractLat('-66.56'), -66.56)
  t.is(extractLat('66.56'), 66.56)

  t.is(extractLon('1'), 1)
  t.is(extractLon('1.1'), 1.1)
  t.is(extractLon('-166.56'), -166.56)
  t.is(extractLon('166.56'), 166.56)

  t.throws(() => extractLat('a'), {message: 'Unable to parse value as float'})
  t.throws(() => extractLat('-95'), {message: 'lat must be a float between -90 and 90'})

  t.throws(() => extractLon('a'), {message: 'Unable to parse value as float'})
  t.throws(() => extractLon('-195'), {message: 'lon must be a float between -180 and 180'})
})

test('validateParams / all params', t => {
  const params = {
    foo: 'bar',
    limit: '10',
    lon: '6.5',
    lat: '60',
    q: 'foobar'
  }

  t.deepEqual(validateParams(params, {operation: 'search'}), {
    indexes: ['address'],
    limit: 10,
    lon: 6.5,
    lat: 60,
    q: 'foobar'
  })

  t.deepEqual(validateParams(params, {operation: 'search', parcelOnly: true}), {
    indexes: ['address'],
    limit: 10,
    lon: 6.5,
    lat: 60,
    q: undefined
  })

  t.deepEqual(validateParams(params, {operation: 'reverse'}), {
    indexes: ['address'],
    limit: 10,
    lon: 6.5,
    lat: 60
  })
})

test('validateParams / missing q parameter', t => {
  const error = t.throws(() => validateParams({}, {operation: 'search'}), {message: 'Parse query failed'})
  t.deepEqual(error.detail, ['Error: Missing [q] parameter'])
})

test('validateParams / with parcelOnly', t => {
  t.deepEqual(
    validateParams({}, {operation: 'search', parcelOnly: true}),
    {
      indexes: ['address'],
      limit: 5,
      q: undefined
    }
  )
})
