import test from 'ava'
import {parseValue, isFirstCharValid, isDepartmentcodeValid, parseFloatAndValidate, isTerrValid, validateLonlat, validateBbox} from '../params.js'

test('isFirstCharValid', t => {
  t.false(isFirstCharValid('---'))
  t.true(isFirstCharValid('A--'))
  t.true(isFirstCharValid('1--'))
  t.true(isFirstCharValid('é--'))
  t.true(isFirstCharValid('É--'))
})

test('isDepartmentcodeValid', t => {
  t.true(isDepartmentcodeValid('01'))
  t.true(isDepartmentcodeValid('972'))
  t.true(isDepartmentcodeValid('2A'))
  t.true(isDepartmentcodeValid('2B'))
  t.false(isDepartmentcodeValid('20'))
  t.false(isDepartmentcodeValid('001'))
  t.false(isDepartmentcodeValid('1234'))
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

test('parseFloatAndValidate', t => {
  t.is(parseFloatAndValidate('1.2'), 1.2)
  t.is(parseFloatAndValidate('-99.9'), -99.9)
  t.is(parseFloatAndValidate('0'), 0)

  t.throws(() => parseValue('abc', 'float'), {message: 'Unable to parse value as float'})
  t.throws(() => parseValue('1.0abc', 'float'), {message: 'Unable to parse value as float'})
})

test('isTerrValid', t => {
  t.true(isTerrValid('METROPOLE'))
  t.true(isTerrValid('DOM'))
  t.true(isTerrValid('01'))
  t.true(isTerrValid('12345'))
  t.false(isTerrValid('abc'))
  t.false(isTerrValid('123456'))
  t.false(isTerrValid('1'))
})

test('validateLonlat', t => {
  t.is(validateLonlat('1,-66'), undefined)
  t.throws(() => validateLonlat('1'), {message: 'lonlat must be in the format "lon,lat"'})
  t.throws(() => validateLonlat('-195,48'), {message: 'lon must be a float between -180 and 180'})
  t.throws(() => validateLonlat('2,-95'), {message: 'lat must be a float between -90 and 90'})
})

test('validateBbox', t => {
  t.is(validateBbox('1,-66,2,-66'), undefined)
  t.throws(() => validateBbox('1'), {message: 'bbox must be in the format "xmin,ymin,xmax,ymax"'})
  t.throws(() => validateBbox('a,b,c,d'), {message: 'Unable to parse value as float'})
  t.throws(() => validateBbox('-195,-44,2,-66'), {message: 'xmin must be a float between -180 and 180'})
  t.throws(() => validateBbox('1,-95,2,-66'), {message: 'ymin must be a float between -90 and 90'})
  t.throws(() => validateBbox('1,-44,-195,-66'), {message: 'xmax must be a float between -180 and 180'})
  t.throws(() => validateBbox('1,-44,2,95'), {message: 'ymax must be a float between -90 and 90'})
})
