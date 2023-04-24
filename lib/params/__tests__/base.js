import test from 'ava'
import {extractParam} from '../../util/params.js'
import {PARAMS, extractParams, validateSearchgeom, validateCoordinateValues} from '../base.js'

test('validateCoordinateValues', t => {
  t.is(validateCoordinateValues([2.1, 48.5, 2, 0, -2.5, +2.5]), undefined)
  t.is(validateCoordinateValues(['2.1', '48.5', '2', '0', '-2.5', '+2.5']), undefined)

  t.throws(() => validateCoordinateValues(['abc', 2]), {message: 'Unable to parse value as float'})
  t.throws(() => validateCoordinateValues([2, '1.0abc']), {message: 'Unable to parse value as float'})
})

test('validateSearchgeom', t => {
  t.is(validateSearchgeom({type: 'Circle', coordinates: [2.1, 48.5], radius: 100}), undefined)
  t.is(validateSearchgeom({type: 'Point', coordinates: [2, 48.5]}), undefined)

  t.is(validateSearchgeom({type: 'LineString', coordinates: [
    [2.3, 48.8],
    [4.3, 49.8],
    [5.3, 50.8]
  ]}), undefined)

  t.is(validateSearchgeom({type: 'Polygon', coordinates: [
    [
      [2.3, 48.8],
      [4.3, 49.8],
      [5.3, 50.8],
      [2.3, 48.8]
    ]
  ]}), undefined)

  t.throws(() => validateSearchgeom({type: 'foo', coordinates: [2.1, 48.5]}), {message: 'Error: Parameter [searchgeom] Geometry type not allowed \'foo\''})
  t.throws(() => validateSearchgeom({coordinates: [2.1, 48.5]}), {message: 'Error: Parameter [searchgeom] Geometry object must have a \'type\' property'})
  t.throws(() => validateSearchgeom({type: 'Point'}), {message: 'Error: Parameter [searchgeom] Not valid geometry: property \'coordinates\' missing Point'})

  t.throws(
    () => validateSearchgeom({type: 'Circle', coordinates: [2.1, 48.5]}),
    {message: 'Error: Parameter [searchgeom] Not valid Circle geometry: property \'radius\' missing'})

  t.throws(
    () => validateSearchgeom({type: 'Circle', coordinates: [2.1, 48.5], radius: 'foo'}),
    {message: 'Error: Parameter [searchgeom] Not valid Circle geometry: \'radius\' must be a number'})

  t.throws(() => validateSearchgeom({type: 'LineString', coordinates: [
    ['foo', 48.8],
    [2.3, 49.8],
    [2.3, 50.8]
  ]}), {message: 'Error: Parameter [searchgeom] each element in a position must be a number'})
})

test('validateSearchgeom / wrong structure', t => {
  t.throws(
    () => validateSearchgeom({type: 'Point', coordinates: [48.5]}),
    {message: 'Error: Parameter [searchgeom] position must have 2 or more elements'})

  t.throws(
    () => validateSearchgeom({type: 'Circle', coordinates: [48.5], radius: 100}),
    {message: 'Error: Parameter [searchgeom] Not valid Circle geometry: coordinates must have 2 elements (lon, lat)'})

  t.throws(
    () => validateSearchgeom({type: 'LineString', coordinates: [2.1]}),
    {message: 'Error: Parameter [searchgeom] a line needs to have two or more coordinates to be valid'})

  t.throws(
    () => validateSearchgeom({type: 'LineString', coordinates: [2.1, 48.5]}),
    {message: 'Error: Parameter [searchgeom] position should be an array, is a number instead'})

  t.throws(
    () => validateSearchgeom({type: 'Polygon', coordinates: [2.1, 48.5]}),
    {message: 'Error: Parameter [searchgeom] a number was found where a coordinate array should have been found: this needs to be nested more deeply'})

  t.throws(
    () => validateSearchgeom({type: 'Polygon', coordinates: [
      [
        [2.3, 48.8],
        [4.3, 49.8]
      ]
    ]}),
    {message: 'Error: Parameter [searchgeom] a LinearRing of coordinates needs to have four or more positions'})

  t.throws(
    () => validateSearchgeom({type: 'Polygon', coordinates: [
      [
        [2.3, 48.8],
        [4.3, 49.8],
        [3.5, 50.1],
        [2.3, 48.8]
      ],
      [
        [2.8, 49.2],
        [3.2, 49.2]
      ]
    ]}),
    {message: 'Error: Parameter [searchgeom] a LinearRing of coordinates needs to have four or more positions'})
})

test('extractParam / q', t => {
  function extractQ(q) {
    return extractParam({q}, 'q', PARAMS.q, PARAMS)
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
    return extractParam({limit}, 'limit', PARAMS.limit, PARAMS)
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
    return extractParam({index}, 'indexes', PARAMS.indexes, PARAMS)
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
    return extractParam({lon}, 'lon', PARAMS.lon, PARAMS)
  }

  function extractLat(lat) {
    return extractParam({lat}, 'lat', PARAMS.lat, PARAMS)
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

test('extractParam / type', t => {
  function extractType(type) {
    return extractParam({type}, 'type', PARAMS.type, PARAMS)
  }

  t.is(extractType('housenumber'), 'housenumber')
  t.is(extractType('street'), 'street')
  t.is(extractType('locality'), 'locality')
  t.is(extractType('municipality'), 'municipality')

  t.throws(() => extractType('foo'), {message: 'Unexpected value \'foo\' for param type'})
  t.throws(() => extractType('housenumber bar'), {message: 'Unexpected value \'housenumber bar\' for param type'})
})

test('extractParam / postcode', t => {
  function extractPostcode(postcode) {
    return extractParam({postcode}, 'postcode', PARAMS.postcode, PARAMS)
  }

  t.is(extractPostcode('12345'), '12345')

  t.throws(() => extractPostcode('1234'), {message: 'Param postcode must contain 5 digits'})
  t.throws(() => extractPostcode('123456'), {message: 'Param postcode must contain 5 digits'})
  t.throws(() => extractPostcode('12E45'), {message: 'Param postcode must contain 5 digits'})
})

test('extractParam / citycode', t => {
  function extractCitycode(citycode) {
    return extractParam({citycode}, 'citycode', PARAMS.citycode, PARAMS)
  }

  t.is(extractCitycode('12345'), '12345')
  t.is(extractCitycode('1A345'), '1A345')
  t.is(extractCitycode('1B345'), '1B345')

  t.throws(() => extractCitycode('12A45'), {message: 'Param citycode is invalid'})
  t.throws(() => extractCitycode('A1245'), {message: 'Param citycode is invalid'})
  t.throws(() => extractCitycode('123A5'), {message: 'Param citycode is invalid'})
  t.throws(() => extractCitycode('1234A'), {message: 'Param citycode is invalid'})
  t.throws(() => extractCitycode('1a345'), {message: 'Param citycode is invalid'})
  t.throws(() => extractCitycode('1b345'), {message: 'Param citycode is invalid'})
  t.throws(() => extractCitycode('1A3456'), {message: 'Param citycode is invalid'})
})

test('extractParam / city', t => {
  function extractCity(city) {
    return extractParam({city}, 'city', PARAMS.city, PARAMS)
  }

  t.is(extractCity('foo'), 'foo')
  t.is(extractCity(' foo '), 'foo')
  t.is(extractCity(' foo-bar'), 'foo-bar')
  t.is(extractCity('Y'), 'Y')
  t.is(extractCity(''), undefined)

  t.throws(
    () => extractCity(Array.from({length: 60}).fill('a').join('')),
    {message: 'must contain between 1 and 50 chars'}
  )
})

test('extractParam / category', t => {
  function extractCategory(category) {
    return extractParam({category}, 'category', PARAMS.category, PARAMS)
  }

  t.deepEqual(extractCategory('aérodrome'), ['aérodrome'])
  t.deepEqual(extractCategory('administratif'), ['administratif'])
  t.deepEqual(extractCategory('barrage'), ['barrage'])
  t.deepEqual(extractCategory('aérodrome,administratif,barrage'), ['aérodrome', 'administratif', 'barrage'])
  t.is(extractCategory(''), undefined)

  t.throws(
    () => extractCategory('foo'),
    {message: 'Unexpected value \'foo\' for param category'}
  )
  t.throws(
    () => extractCategory('bar'),
    {message: 'Unexpected value \'bar\' for param category'}
  )
})

test('extractParam / returntruegeometry', t => {
  function extractReturntruegeometry(returntruegeometry) {
    return extractParam({returntruegeometry}, 'returntruegeometry', PARAMS.returntruegeometry, PARAMS)
  }

  t.is(extractReturntruegeometry(''), undefined)
  t.is(extractReturntruegeometry(' '), undefined)
  t.true(extractReturntruegeometry(' true '))
  t.true(extractReturntruegeometry('yes'))
  t.true(extractReturntruegeometry('1'))
  t.false(extractReturntruegeometry(' false '))
  t.false(extractReturntruegeometry('no'))
  t.false(extractReturntruegeometry('0'))
  t.throws(() => extractReturntruegeometry('a'), {message: 'Unable to parse value as boolean'})
})

test('extractParam / departmentcode', t => {
  function extractDepartmentcode(departmentcode) {
    return extractParam({departmentcode}, 'departmentcode', PARAMS.departmentcode, PARAMS)
  }

  t.is(extractDepartmentcode('01'), '01')
  t.is(extractDepartmentcode('2A'), '2A')
  t.is(extractDepartmentcode('2B'), '2B')
  t.is(extractDepartmentcode('971'), '971')
  t.is(extractDepartmentcode('972'), '972')
  t.is(extractDepartmentcode('973'), '973')
  t.is(extractDepartmentcode('974'), '974')
  t.is(extractDepartmentcode('976'), '976')

  t.throws(() => extractDepartmentcode('20'), {message: 'Param departmentcode is invalid'})
  t.throws(() => extractDepartmentcode('97'), {message: 'Param departmentcode is invalid'})
  t.throws(() => extractDepartmentcode('3A'), {message: 'Param departmentcode is invalid'})
  t.throws(() => extractDepartmentcode('001'), {message: 'Param departmentcode is invalid'})
  t.throws(() => extractDepartmentcode('12345'), {message: 'Param departmentcode is invalid'})
})

test('extractParam / municipalitycode', t => {
  function extractMunicipalitycode(municipalitycode) {
    return extractParam({municipalitycode}, 'municipalitycode', PARAMS.municipalitycode, PARAMS)
  }

  t.is(extractMunicipalitycode('123'), '123')
  t.is(extractMunicipalitycode('001'), '001')
  t.is(extractMunicipalitycode('01'), '01')

  t.throws(() => extractMunicipalitycode('1234'), {message: 'Param municipalitycode is invalid'})
  t.throws(() => extractMunicipalitycode('12A'), {message: 'Param municipalitycode is invalid'})
  t.throws(() => extractMunicipalitycode('A12'), {message: 'Param municipalitycode is invalid'})
  t.throws(() => extractMunicipalitycode('1A3'), {message: 'Param municipalitycode is invalid'})
})

test('extractParam / oldmunicipalitycode', t => {
  function extractOldmunicipalitycode(oldmunicipalitycode) {
    return extractParam({oldmunicipalitycode}, 'oldmunicipalitycode', PARAMS.oldmunicipalitycode, PARAMS)
  }

  t.is(extractOldmunicipalitycode('123'), '123')
  t.is(extractOldmunicipalitycode('000'), '000')

  t.throws(() => extractOldmunicipalitycode('01'), {message: 'Param oldmunicipalitycode is invalid'})
  t.throws(() => extractOldmunicipalitycode('1234'), {message: 'Param oldmunicipalitycode is invalid'})
  t.throws(() => extractOldmunicipalitycode('12A'), {message: 'Param oldmunicipalitycode is invalid'})
  t.throws(() => extractOldmunicipalitycode('A12'), {message: 'Param oldmunicipalitycode is invalid'})
  t.throws(() => extractOldmunicipalitycode('1A3'), {message: 'Param oldmunicipalitycode is invalid'})
})

test('extractParam / districtcode', t => {
  function extractDistrictcode(districtcode) {
    return extractParam({districtcode}, 'districtcode', PARAMS.districtcode, PARAMS)
  }

  t.is(extractDistrictcode('123'), '123')

  t.throws(() => extractDistrictcode('1A2'), {message: 'Param districtcode is invalid'})
  t.throws(() => extractDistrictcode('1'), {message: 'Param districtcode is invalid'})
  t.throws(() => extractDistrictcode('1234'), {message: 'Param districtcode is invalid'})
})

test('extractParam / section', t => {
  function extractSection(section) {
    return extractParam({section}, 'section', PARAMS.section, PARAMS)
  }

  t.is(extractSection('0A'), '0A')
  t.is(extractSection('1'), '1')
  t.is(extractSection('11'), '11')
  t.is(extractSection('A'), 'A')
  t.is(extractSection(''), undefined)

  t.throws(() => extractSection('A1'), {message: 'Param section is invalid'})
  t.throws(() => extractSection('ab'), {message: 'Param section is invalid'})
  t.throws(() => extractSection('b2'), {message: 'Param section is invalid'})
  t.throws(() => extractSection('aaa'), {message: 'Param section is invalid'})
  t.throws(() => extractSection('ba2'), {message: 'Param section is invalid'})
})

test('extractParam / number', t => {
  function extractNumber(number) {
    return extractParam({number}, 'number', PARAMS.number, PARAMS)
  }

  t.is(extractNumber('1234'), '1234')
  t.is(extractNumber('0011'), '0011')
  t.is(extractNumber('01'), '01')
  t.is(extractNumber(''), undefined)

  t.throws(() => extractNumber('a12'), {message: 'Param number is invalid'})
  t.throws(() => extractNumber('12a'), {message: 'Param number is invalid'})
  t.throws(() => extractNumber('12345'), {message: 'Param number is invalid'})
})

test('extractParam / sheet', t => {
  function extractSheet(sheet) {
    return extractParam({sheet}, 'sheet', PARAMS.sheet, PARAMS)
  }

  t.is(extractSheet('1'), '1')
  t.is(extractSheet('01'), '01')
  t.is(extractSheet(''), undefined)

  t.throws(() => extractSheet('1234'), {message: 'Param sheet is invalid'})
  t.throws(() => extractSheet('a12'), {message: 'Param sheet is invalid'})
  t.throws(() => extractSheet('12a'), {message: 'Param sheet is invalid'})
})

test('extractParams / all params', t => {
  t.deepEqual(extractParams({
    foo: 'bar',
    limit: '10',
    lon: '6.5',
    lat: '60',
    q: 'foobar'
  }, {operation: 'search'}, PARAMS), {
    indexes: ['address'],
    limit: 10,
    lon: 6.5,
    lat: 60,
    q: 'foobar'
  })
})

test('extractParams / missing q parameter', t => {
  const error = t.throws(() => extractParams({}, {operation: 'search'}), {message: 'Failed parsing query'})
  t.deepEqual(error.detail, ['q is a required param'])
})

test('extractParams / missing q but parcel only', t => {
  t.deepEqual(
    extractParams({index: 'parcel'}, {operation: 'search'}),
    {
      indexes: ['parcel'],
      limit: 5
    }
  )
})

test('extractParams / with searchgeom', t => {
  t.deepEqual(extractParams({
    searchgeom: '{"type": "Circle", "coordinates": [2.1, 48.5], "radius": 100}',
    limit: '10'
  }, {operation: 'reverse'}), {
    indexes: ['address'],
    searchgeom: {
      type: 'Circle',
      coordinates: [2.1, 48.5],
      radius: 100
    },
    limit: 10
  })
})

test('extractParams / searchgeom geometry not allowed', t => {
  const error = t.throws(
    () => extractParams({searchgeom: '{"type": "Point", "coordinates": [2.1, 48.5]}'},
      {operation: 'reverse'}), {message: 'Failed parsing query'})

  t.deepEqual(error.detail, ['Error: Parameter [searchgeom] Geometry type \'Point\' not allowed for index(es) \'address\''])
})
