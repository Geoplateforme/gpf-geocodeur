import test from 'ava'
import {parseValue, isFirstCharValid, isDepartmentcodeValid, parseFloatAndValidate, extractParam} from '../params.js'

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

test('parseValue / custom', t => {
  t.is(parseValue('', 'custom'), undefined)
  t.is(parseValue(' ', 'custom'), undefined)
  t.is(parseValue(' abc ', 'custom'), 'abc')
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
  t.throws(() => parseValue('a', 'boolean'), {message: 'unable to parse value as boolean'})
})

test('parseValue / integer', t => {
  t.is(parseValue('', 'integer'), undefined)
  t.is(parseValue(' ', 'integer'), undefined)
  t.is(parseValue('1', 'integer'), 1)
  t.is(parseValue('-999', 'integer'), -999)
  t.is(parseValue('0', 'integer'), 0)
  t.is(parseValue(' +100 ', 'integer'), 100)

  t.throws(() => parseValue('abc', 'integer'), {message: 'unable to parse value as integer'})
  t.throws(() => parseValue('1.0', 'integer'), {message: 'unable to parse value as integer'})
  t.throws(() => parseValue('100000000000000000000000000000000', 'integer'), {message: 'unable to parse value as integer'})
})

test('parseValue / float', t => {
  t.is(parseValue('', 'float'), undefined)
  t.is(parseValue(' ', 'float'), undefined)
  t.is(parseValue('1.0', 'float'), 1)
  t.is(parseValue('-99.9', 'float'), -99.9)
  t.is(parseValue('0', 'float'), 0)
  t.is(parseValue(' +100.99994 ', 'float'), 100.999_94)

  t.throws(() => parseValue('abc', 'float'), {message: 'unable to parse value as float'})
  t.throws(() => parseValue('1.0abc', 'float'), {message: 'unable to parse value as float'})
})

test('parseValue / object', t => {
  t.is(parseValue('', 'object'), undefined)
  t.is(parseValue(' ', 'object'), undefined)
  t.deepEqual(parseValue('{}', 'object'), {})
  t.deepEqual(parseValue('[]', 'object'), [])
  t.deepEqual(parseValue('["foo"]', 'object'), ['foo'])
  t.deepEqual(parseValue('{"foo": "bar", "foobar": 123}', 'object'), {foo: 'bar', foobar: 123})
  t.deepEqual(parseValue('{"foobar": [12, 1.1]}', 'object'), {foobar: [12, 1.1]})

  t.throws(() => parseValue('foo', 'object'), {message: 'unable to parse value as valid JSON or GeoJSON object'})
  t.throws(() => parseValue('123', 'object'), {message: 'unable to parse value as valid JSON or GeoJSON object'})
})

test('parseValue / other', t => {
  t.throws(() => parseValue('abc', 'other'), {message: 'unsupported value type: other'})
})

test('parseFloatAndValidate', t => {
  t.is(parseFloatAndValidate('1.2'), 1.2)
  t.is(parseFloatAndValidate('-99.9'), -99.9)
  t.is(parseFloatAndValidate('0'), 0)

  t.throws(() => parseValue('abc', 'float'), {message: 'unable to parse value as float'})
  t.throws(() => parseValue('1.0abc', 'float'), {message: 'unable to parse value as float'})
})

test('extractParam / custom', t => {
  const def = {
    type: 'custom',
    extract(v) {
      return v + 'baz'
    }
  }

  t.is(extractParam({foo: 'bar'}, 'foo', def), 'barbaz')
})
