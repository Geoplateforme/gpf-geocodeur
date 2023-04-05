import test from 'ava'
import {extractParams, parseValue, isFirstCharValid, extractParam, PARAMS} from '../params.js'

test('isFirstCharValid', t => {
  t.false(isFirstCharValid('---'))
  t.true(isFirstCharValid('A--'))
  t.true(isFirstCharValid('1--'))
  t.true(isFirstCharValid('é--'))
  t.true(isFirstCharValid('É--'))
})

test('parseValue / string', t => {
  t.is(parseValue('', 'string'), undefined)
  t.is(parseValue(' ', 'string'), undefined)
  t.is(parseValue(' abc ', 'string'), 'abc')
})

test('parseValue / boolean', t => {
  t.is(parseValue('', 'boolean'), undefined)
  t.is(parseValue(' ', 'boolean'), undefined)
  t.true(parseValue(' true ', 'boolean'))
  t.true(parseValue('yes', 'boolean'))
  t.true(parseValue('1', 'boolean'))
  t.false(parseValue(' false ', 'boolean'))
  t.false(parseValue('no', 'boolean'))
  t.false(parseValue('0', 'boolean'))
  t.throws(() => parseValue('a', 'boolean'), {message: 'Unable to parse value as boolean'})
})

test('parseValue / integer', t => {
  t.is(parseValue('', 'integer'), undefined)
  t.is(parseValue(' ', 'integer'), undefined)
  t.is(parseValue('1', 'integer'), 1)
  t.is(parseValue('-999', 'integer'), -999)
  t.is(parseValue('0', 'integer'), 0)
  t.is(parseValue(' +100 ', 'integer'), 100)

  t.throws(() => parseValue('abc', 'integer'), {message: 'Unable to parse value as integer'})
  t.throws(() => parseValue('1.0', 'integer'), {message: 'Unable to parse value as integer'})
  t.throws(() => parseValue('100000000000000000000000000000000', 'integer'), {message: 'Unable to parse value as integer'})
})

test('parseValue / float', t => {
  t.is(parseValue('', 'float'), undefined)
  t.is(parseValue(' ', 'float'), undefined)
  t.is(parseValue('1.0', 'float'), 1)
  t.is(parseValue('-99.9', 'float'), -99.9)
  t.is(parseValue('0', 'float'), 0)
  t.is(parseValue(' +100.99994 ', 'float'), 100.999_94)

  t.throws(() => parseValue('abc', 'float'), {message: 'Unable to parse value as float'})
  t.throws(() => parseValue('1.0abc', 'float'), {message: 'Unable to parse value as float'})
})

test('parseValue / other', t => {
  t.throws(() => parseValue('abc', 'other'), {message: 'Unsupported value type: other'})
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

test('extractParam / type', t => {
  function extractType(type) {
    return extractParam({type}, 'type', PARAMS.type)
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
    return extractParam({postcode}, 'postcode', PARAMS.postcode)
  }

  t.is(extractPostcode('12345'), '12345')

  t.throws(() => extractPostcode('1234'), {message: 'Param postcode must contain 5 digits'})
  t.throws(() => extractPostcode('123456'), {message: 'Param postcode must contain 5 digits'})
  t.throws(() => extractPostcode('12E45'), {message: 'Param postcode must contain 5 digits'})
})

test('extratParam / citycode', t => {
  function extractCitycode(citycode) {
    return extractParam({citycode}, 'citycode', PARAMS.citycode)
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
    return extractParam({city}, 'city', PARAMS.city)
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
    return extractParam({category}, 'category', PARAMS.category)
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
    return extractParam({returntruegeometry}, 'returntruegeometry', PARAMS.returntruegeometry)
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

test('extratParam / departmentcode', t => {
  function extractDepartmentcode(departmentcode) {
    return extractParam({departmentcode}, 'departmentcode', PARAMS.departmentcode)
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
  t.throws(() => extractDepartmentcode('975'), {message: 'Param departmentcode is invalid'})
  t.throws(() => extractDepartmentcode('978'), {message: 'Param departmentcode is invalid'})
  t.throws(() => extractDepartmentcode('001'), {message: 'Param departmentcode is invalid'})
  t.throws(() => extractDepartmentcode('12345'), {message: 'Param departmentcode is invalid'})
})

test('extratParam / municipalitycode', t => {
  function extractMunicipalitycode(municipalitycode) {
    return extractParam({municipalitycode}, 'municipalitycode', PARAMS.municipalitycode)
  }

  t.is(extractMunicipalitycode('123'), '123')
  t.is(extractMunicipalitycode('001'), '001')
  t.is(extractMunicipalitycode('01'), '01')

  t.throws(() => extractMunicipalitycode('12A'), {message: 'Param municipalitycode is invalid'})
  t.throws(() => extractMunicipalitycode('A12'), {message: 'Param municipalitycode is invalid'})
  t.throws(() => extractMunicipalitycode('1A3'), {message: 'Param municipalitycode is invalid'})
})

test('extratParam / oldmunicipalitycode', t => {
  function extractOldmunicipalitycode(oldmunicipalitycode) {
    return extractParam({oldmunicipalitycode}, 'oldmunicipalitycode', PARAMS.oldmunicipalitycode)
  }

  t.is(extractOldmunicipalitycode('123'), '123')
  t.is(extractOldmunicipalitycode('001'), '001')
  t.is(extractOldmunicipalitycode('01'), '01')

  t.throws(() => extractOldmunicipalitycode('12A'), {message: 'Param oldmunicipalitycode is invalid'})
  t.throws(() => extractOldmunicipalitycode('A12'), {message: 'Param oldmunicipalitycode is invalid'})
  t.throws(() => extractOldmunicipalitycode('1A3'), {message: 'Param oldmunicipalitycode is invalid'})
})

test('extratParam / districtcode', t => {
  function extractDistrictcode(districtcode) {
    return extractParam({districtcode}, 'districtcode', PARAMS.districtcode)
  }

  t.is(extractDistrictcode('1234'), '1234')
  t.is(extractDistrictcode('1A34'), '1A34')
  t.is(extractDistrictcode('1B34'), '1B34')

  t.throws(() => extractDistrictcode('12A4'), {message: 'Param districtcode is invalid'})
  t.throws(() => extractDistrictcode('A124'), {message: 'Param districtcode is invalid'})
  t.throws(() => extractDistrictcode('123A'), {message: 'Param districtcode is invalid'})
  t.throws(() => extractDistrictcode('1a34'), {message: 'Param districtcode is invalid'})
  t.throws(() => extractDistrictcode('1b34'), {message: 'Param districtcode is invalid'})
  t.throws(() => extractDistrictcode('1A346'), {message: 'Param districtcode is invalid'})
})

test('extractParam / section', t => {
  function extractSection(section) {
    return extractParam({section}, 'section', PARAMS.section)
  }

  t.is(extractSection('A1'), 'A1')
  t.is(extractSection('ab'), 'ab')
  t.is(extractSection('b2'), 'b2')
  t.is(extractSection(''), undefined)

  t.throws(() => extractSection('1A'), {message: 'Param section is invalid'})
  t.throws(() => extractSection('aaa'), {message: 'Param section is invalid'})
  t.throws(() => extractSection('ba2'), {message: 'Param section is invalid'})
})

test('extractParam / number', t => {
  function extractNumber(number) {
    return extractParam({number}, 'number', PARAMS.number)
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
    return extractParam({sheet}, 'sheet', PARAMS.sheet)
  }

  t.is(extractSheet('1234'), 1234)
  t.is(extractSheet('1'), 1)
  t.is(extractSheet(''), undefined)

  t.throws(() => extractSheet('a12'), {message: 'Unable to parse value as integer'})
  t.throws(() => extractSheet('12a'), {message: 'Unable to parse value as integer'})
  t.throws(() => extractSheet('01'), {message: 'Unable to parse value as integer'})
})

test('extractParams / all params', t => {
  t.deepEqual(extractParams({
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
