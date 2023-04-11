import test from 'ava'
import {dispatchRequestToIndexes} from '../indexes/index.js'

test('dispatchRequestToIndexes / search operation', async t => {
  const params = {
    indexes: ['address', 'poi', 'parcel']
  }

  const indexes = {
    address: {
      async search() {
        return 'search address'
      }
    },
    poi: {
      async search() {
        return 'search poi'
      }
    },
    parcel: {
      async search() {
        return 'search parcel'
      }
    }
  }

  const result = await dispatchRequestToIndexes(params, 'search', indexes)

  t.deepEqual(result, {
    address: 'search address',
    poi: 'search poi',
    parcel: 'search parcel'
  })
})

test('dispatchRequestToIndexes / reverse operation', async t => {
  const params = {
    indexes: ['address', 'poi', 'parcel']
  }

  const indexes = {
    address: {
      async reverse() {
        return 'reverse address'
      }
    },
    poi: {
      async reverse() {
        return 'reverse poi'
      }
    },
    parcel: {
      async reverse() {
        return 'reverse parcel'
      }
    }
  }

  const result = await dispatchRequestToIndexes(params, 'reverse', indexes)

  t.deepEqual(result, {
    address: 'reverse address',
    poi: 'reverse poi',
    parcel: 'reverse parcel'
  })
})

test('dispatchRequestToIndexes / invalid index', async t => {
  const params = {
    indexes: ['address', 'poi', 'invalid']
  }

  const indexes = {
    address: {
      async search() {
        return 'address'
      }
    },
    poi: {
      async search() {
        return 'poi'
      }
    },
    parcel: {
      async search() {
        return 'parcel'
      }
    }
  }

  await t.throwsAsync(
    () => dispatchRequestToIndexes(params, 'search', indexes),
    {message: 'Unsupported index type: invalid'}
  )
})

