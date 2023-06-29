import test from 'ava'
import {getArchiveURL} from '../geoservices.js'

test('getArchiveURL', t => {
  const baseURL = 'https://sample.test/{dep}/{crs}'

  t.is(getArchiveURL(baseURL, '12'), 'https://sample.test/D012/LAMB93')
})

test('getArchiveURL / CRS_MAPPING', t => {
  const baseURL = 'https://sample.test/{dep}/{crs}'

  t.is(getArchiveURL(baseURL, '971'), 'https://sample.test/D971/RGAF09UTM20')
})

test('getArchiveURL / Unknown codeDepartement', t => {
  const baseURL = 'https://sample.test/{dep}/{crs}'

  t.throws(() => {
    getArchiveURL(baseURL, '979')
  }, {instanceOf: Error, message: 'Unknown codeDepartement'})
})
