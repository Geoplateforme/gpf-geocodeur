import test from 'ava'
import {matchingCitiesPostFilter} from '../search.js'

test('matchingCitiesPostFilter', t => {
  const postFilter = matchingCitiesPostFilter([{code: '12345'}, {code: '23456'}])

  t.true(postFilter({properties: {citycode: '12345'}}))
  t.true(postFilter({properties: {citycode: ['23456']}}))
  t.false(postFilter({properties: {citycode: '55555'}}))
  t.false(postFilter({properties: {}}))
  t.false(postFilter({properties: {citycode: ['99999', '00000']}}))
})
