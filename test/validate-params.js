import test from 'ava'
import validateParams, {isFirstCharValid, extractParam, PARAMS} from '../lib/validate-params.js'

test('isFirstCharValid', t => {
  t.false(isFirstCharValid('---'))
  t.true(isFirstCharValid('A--'))
  t.true(isFirstCharValid('1--'))
  t.true(isFirstCharValid('é--'))
  t.true(isFirstCharValid('É--'))
})

test('extractParam / q', t => {
  function extractQ(q) {
    return extractParam({q}, 'q', PARAMS.q)
  }

  t.is(extractQ('foo'), 'foo')
  t.is(extractQ(' foo '), 'foo')
  t.is(extractQ(''), undefined)

  t.throws(
    () => extractQ('aa'),
    {message: 'must contain between 3 and 200 chars and start with a number or a letter'}
  )
  t.throws(
    () => extractQ('-aaa'),
    {message: 'must contain between 3 and 200 chars and start with a number or a letter'}
  )
  t.throws(
    () => extractQ('   aa'),
    {message: 'must contain between 3 and 200 chars and start with a number or a letter'}
  )
  t.throws(
    () => extractQ(Array.from({length: 300}).fill('a').join('')),
    {message: 'must contain between 3 and 200 chars and start with a number or a letter'}
  )
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
  t.deepEqual(validateParams({
    foo: 'bar',
    limit: '10',
    lon: '6.5',
    lat: '60',
    q: 'foobar'
  }, {operation: 'search'}), {
    indexes: ['address'],
    limit: 10,
    lon: 6.5,
    lat: 60,
    q: 'foobar'
  })
})

test('validateParams / missing q parameter', t => {
  const error = t.throws(() => validateParams({}, {operation: 'search'}), {message: 'Failed parsing query'})
  t.deepEqual(error.detail, ['q is a required param'])
})

test('validateParams / missing q but parcel only', t => {
  t.deepEqual(
    validateParams({index: 'parcel'}, {operation: 'search'}),
    {
      indexes: ['parcel'],
      limit: 5
    }
  )
})
