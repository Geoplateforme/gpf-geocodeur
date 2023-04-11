import test from 'ava'
import {dispatchRequestToIndexes} from '../indexes/index.js'

test('dispatchRequestToIndexes', async t => {
  const params = {
    indexes: ['foo', 'bar', 'foobar']
  }

  const indexes = {
    foo: {
      async doSomething() {
        return 'foo result'
      }
    },
    bar: {
      async doSomething() {
        return 'bar result'
      }
    },
    foobar: {
      async doSomething() {
        return 'foobar result'
      }
    }
  }

  const result = await dispatchRequestToIndexes(params, 'doSomething', indexes)

  t.deepEqual(result, {
    foo: 'foo result',
    bar: 'bar result',
    foobar: 'foobar result'
  })
})

test('dispatchRequestToIndexes / invalid index', async t => {
  const params = {
    indexes: ['foo', 'bar', 'invalid']
  }

  const indexes = {
    foo: {
      async doSomething() {
        return 'foo result'
      }
    },
    bar: {
      async doSomething() {
        return 'bar result'
      }
    },
    foobar: {
      async doSomething() {
        return 'foobar result'
      }
    }
  }

  await t.throwsAsync(
    () => dispatchRequestToIndexes(params, 'doSomething', indexes),
    {message: 'Unsupported index type: invalid'}
  )
})

test('dispatchRequestToIndexes / operation error', async t => {
  const params = {
    indexes: ['foo', 'bar', 'foobar']
  }

  const indexes = {
    foo: {
      doSomething() {
        return 'some result'
      }
    },
    bar: {
      doSomethingElse() {
        return 'some other result'
      }
    },
    foobar: {
      doOtherThing() {
        return 'other result'
      }
    }
  }

  await t.throwsAsync(
    () => dispatchRequestToIndexes(params, 'doSomethingElse', indexes),
    {message: 'Unsupported operation: doSomethingElse with the index: foo'}
  )
})
