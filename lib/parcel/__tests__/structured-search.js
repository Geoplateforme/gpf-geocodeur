import test from 'ava'
import {validateStructuredSearchParams} from '../structured-search.js'

test('validateStructuredSearchParams / no departement code', t => {
  t.throws(() => validateStructuredSearchParams({}), {
    message: 'departmentcode is required for structured search'
  })
})

test('validateStructuredSearchParams / no municipalitycode', t => {
  t.throws(() => validateStructuredSearchParams({departmentcode: 55}), {
    message: 'municipalitycode or districtcode is required for structured search'
  })
})

test('validateStructuredSearchParams / no districtcode', t => {
  t.throws(() => validateStructuredSearchParams({departmentcode: 75, municipalitycode: '056'}), {
    message: 'districtcode is required for structured search on Paris/Lyon/Marseille'
  })
})
