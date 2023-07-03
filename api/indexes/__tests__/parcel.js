import test from 'ava'
import {prepareRequest} from '../parcel.js'

const params = {
  q: 'metz',
  limit: 5,
  returntruegeometry: true,
  geometry: {
    type: 'Point',
    coordinates: [0, 0]
  }
}

test('prepareRequest', t => {
  const preparedRequest = prepareRequest(params)

  t.is(preparedRequest.id, 'metz')
  t.is(preparedRequest.center, undefined)
  t.is(preparedRequest.limit, 5)
  t.true(preparedRequest.returntruegeometry)
})
