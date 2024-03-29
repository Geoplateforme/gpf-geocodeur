import test from 'ava'
import {extractParam} from '../../util/params.js'
import {normalizeQuery} from '../../util/querystring.js'
import {AUTOCOMPLETE, extractParams, isTerrValid, validateBbox, validateLonlat} from '../autocomplete.js'

test('isTerrValid', t => {
  t.true(isTerrValid('METROPOLE'))
  t.true(isTerrValid('DOMTOM'))
  t.true(isTerrValid('01'))
  t.true(isTerrValid('2A'))
  t.true(isTerrValid('976'))
  t.true(isTerrValid('12345'))
  t.false(isTerrValid('abc'))
  t.false(isTerrValid('3A'))
  t.false(isTerrValid('123456'))
  t.false(isTerrValid('1'))
})

test('validateLonlat', t => {
  t.is(validateLonlat([1, -66]), undefined)
  t.throws(() => validateLonlat([-195, 48]), {message: 'lon: must be a float between -180 and 180'})
  t.throws(() => validateLonlat([2, -95]), {message: 'lat: must be a float between -90 and 90'})
})

test('validateBbox', t => {
  t.is(validateBbox([1, -66, 2, -66]), undefined)
  t.throws(() => validateBbox([-195, -44, 2, -66]), {message: 'xmin: must be a float between -180 and 180'})
  t.throws(() => validateBbox([1, -95, 2, -66]), {message: 'ymin: must be a float between -90 and 90'})
  t.throws(() => validateBbox([1, -44, -195, -66]), {message: 'xmax: must be a float between -180 and 180'})
  t.throws(() => validateBbox([1, -44, 2, 95]), {message: 'ymax: must be a float between -90 and 90'})
})

test('extractParam / text', t => {
  function extractText(text) {
    return extractParam({text}, 'text', AUTOCOMPLETE.text, AUTOCOMPLETE)
  }

  t.is(extractText('foo'), 'foo')
  t.is(extractText(' foo '), 'foo')

  t.throws(() => extractText(''), {message: 'text: required param'})

  t.throws(
    () => extractText('aa'),
    {message: 'text: must contain between 3 and 200 chars and start with a number or a letter'}
  )
  t.throws(
    () => extractText('-aaa'),
    {message: 'text: must contain between 3 and 200 chars and start with a number or a letter'}
  )
  t.throws(
    () => extractText('   aa'),
    {message: 'text: must contain between 3 and 200 chars and start with a number or a letter'}
  )
  t.throws(
    () => extractText(Array.from({length: 300}).fill('a').join('')),
    {message: 'text: must contain between 3 and 200 chars and start with a number or a letter'}
  )
})

test('extractParam / terr', t => {
  function extractTerr(terr) {
    return extractParam({terr}, 'terr', AUTOCOMPLETE.terr, AUTOCOMPLETE)
  }

  t.deepEqual(extractTerr('METROPOLE'), ['METROPOLE'])
  t.deepEqual(extractTerr('DOMTOM'), ['DOMTOM'])
  t.deepEqual(extractTerr('METROPOLE,DOMTOM'), ['METROPOLE', 'DOMTOM'])
  t.deepEqual(extractTerr('12345'), ['12345'])
  t.deepEqual(extractTerr('01'), ['01'])
  t.deepEqual(extractTerr('2A'), ['2A'])
  t.deepEqual(extractTerr('01,12345,METROPOLE,DOMTOM'), ['01', '12345', 'METROPOLE', 'DOMTOM'])

  t.throws(() => extractTerr('aaaaaa,bar'), {message: 'terr: unexpected value'})
  t.throws(() => extractTerr('METROPOLE,bbbbbb'), {message: 'terr: unexpected value'})
})

test('extractParam / poiType', t => {
  function extractPoiType(poiType) {
    return extractParam(normalizeQuery({poiType}), 'poiType', AUTOCOMPLETE.poiType, AUTOCOMPLETE)
  }

  t.is(extractPoiType('aérodrome'), 'aérodrome')
  t.is(extractPoiType('administratif'), 'administratif')
  t.is(extractPoiType('barrage'), 'barrage')
  t.is(extractPoiType(''), undefined)
})

test('extractParam / lonlat', t => {
  function extractLonlat(lonlat) {
    return extractParam({lonlat}, 'lonlat', AUTOCOMPLETE.lonlat, AUTOCOMPLETE)
  }

  t.deepEqual(extractLonlat('1,-66'), [1, -66])
  t.deepEqual(extractLonlat('1.1,-66.56'), [1.1, -66.56])
  t.is(extractLonlat(''), undefined)

  t.throws(() => extractLonlat('1'), {message: 'lonlat: must be in the format "lon,lat"'})
  t.throws(() => extractLonlat('a,a'), {message: 'lonlat: unable to parse value as float'})
  t.throws(() => extractLonlat('2,-95'), {message: 'lonlat: lat: must be a float between -90 and 90'})
  t.throws(() => extractLonlat('-195,48'), {message: 'lonlat: lon: must be a float between -180 and 180'})
})

test('extractParam / type', t => {
  function extractType(type) {
    return extractParam({type}, 'type', AUTOCOMPLETE.type, AUTOCOMPLETE)
  }

  t.deepEqual(extractType('PositionOfInterest'), ['PositionOfInterest'])
  t.deepEqual(extractType('StreetAddress'), ['StreetAddress'])
  t.deepEqual(extractType('PositionOfInterest,StreetAddress'), ['PositionOfInterest', 'StreetAddress'])

  t.throws(() => extractType('foo'), {message: 'type: unexpected value \'foo\''})
  t.throws(() => extractType('housenumber bar'), {message: 'type: unexpected value \'housenumber bar\''})
})

test('extractParam / maximumResponses', t => {
  function extractMaximumResponses(maximumResponses) {
    return extractParam(normalizeQuery({maximumResponses}), 'maximumResponses', AUTOCOMPLETE.maximumResponses, AUTOCOMPLETE)
  }

  t.is(extractMaximumResponses('1'), 1)
  t.is(extractMaximumResponses('5'), 5)
  t.is(extractMaximumResponses('15'), 15)
  t.is(extractMaximumResponses(''), 10)

  for (const maximumResponses of ['0', '-1', '101']) {
    t.throws(() => extractMaximumResponses(maximumResponses), {message: 'maximumResponses: must be an integer between 1 and 15'})
  }

  for (const maximumResponses of ['0.5', 'foo']) {
    t.throws(() => extractMaximumResponses(maximumResponses), {message: 'maximumResponses: unable to parse value as integer'})
  }
})

test('extractParam / bbox', t => {
  function extractBbox(bbox) {
    return extractParam({bbox}, 'bbox', AUTOCOMPLETE.bbox, AUTOCOMPLETE)
  }

  t.deepEqual(extractBbox('1,-44,2,-66'), [1, -44, 2, -66])
  t.deepEqual(extractBbox('1.1,-44.4,2.2,-66.56'), [1.1, -44.4, 2.2, -66.56])
  t.is(extractBbox(''), undefined)

  t.throws(() => extractBbox('1'), {message: 'bbox: must be in the format "xmin,ymin,xmax,ymax"'})
  t.throws(() => extractBbox('a,b,c,d'), {message: 'bbox: unable to parse value as float'})
  t.throws(() => extractBbox('-195,-44,2,-66'), {message: 'bbox: xmin: must be a float between -180 and 180'})
  t.throws(() => extractBbox('1,-95,2,-66'), {message: 'bbox: ymin: must be a float between -90 and 90'})
  t.throws(() => extractBbox('1,-44,-195,-66'), {message: 'bbox: xmax: must be a float between -180 and 180'})
  t.throws(() => extractBbox('1,-44,2,95'), {message: 'bbox: ymax: must be a float between -90 and 90'})
})

test('extractParams', t => {
  t.deepEqual(extractParams({
    text: 'foo',
    terr: '12345',
    lonlat: '2.3,48.8',
    type: 'PositionOfInterest',
    maximumResponses: '10',
    bbox: '2.1,48.7,2.4,49.1'
  }), {
    text: 'foo',
    terr: ['12345'],
    lonlat: [2.3, 48.8],
    type: ['PositionOfInterest'],
    maximumResponses: 10,
    bbox: [2.1, 48.7, 2.4, 49.1]
  })
})

test('extractParams / maximumResponses', t => {
  t.deepEqual(extractParams({
    text: 'foo',
    maximumResponses: '5'
  }), {
    text: 'foo',
    maximumResponses: 5,
    type: ['PositionOfInterest', 'StreetAddress']
  })
})

test('extractParams / missing text parameter', t => {
  const error = t.throws(() => extractParams({}), {message: 'Failed parsing query'})
  t.deepEqual(error.detail, ['text: required param'])
})
