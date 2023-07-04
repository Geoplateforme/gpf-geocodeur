import test from 'ava'
import {createAccumulator} from '../categories.js'

test('createAccumulator', t => {
  const acc = createAccumulator(['foo', 'bar'])
  acc.addCategories(['foo', 'a', 'b'])
  acc.addCategories(['foo', 'a', 'c'])
  acc.addCategories(['foo', 'z', 'c'])
  acc.addCategories(['bar', '1', '2'])
  acc.addCategories(['baz', 'xx', 'yy'])
  const summary = acc.getSummary()

  t.deepEqual(Object.keys(summary).sort(), ['bar', 'foo'])
  t.deepEqual(summary.foo.sort(), ['a', 'b', 'c', 'z'])
  t.deepEqual(summary.bar.sort(), ['1', '2'])
})
