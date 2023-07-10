/* eslint-disable complexity */
import 'dotenv/config.js'

import test from 'ava'
import process from 'node:process'
import path from 'node:path'
import {readFile} from 'node:fs/promises'
import got from 'got'
import yaml, {JSON_SCHEMA} from 'js-yaml'

const {API_TEST_URL} = process.env
const requestsFilePath = path.resolve('./tests/requests.yaml')
const requests = yaml.load(await readFile(requestsFilePath), {schema: JSON_SCHEMA})

function getResults(item, route) {
  const properties = item.properties || {}
  const result = {}

  if (route === '/search' || route === '/reverse') {
    result.id = properties?.extrafields?.cleabs || properties.id
    result.city = Array.isArray(properties.city) ? properties.city[0] : properties.city
    result.citycode = Array.isArray(properties.citycode) ? properties.citycode[0] : properties.citycode
    result.postcode = Array.isArray(properties.postcode) ? properties.postcode[0] : properties.postcode
    result.type = properties.type
    result.municipalitycode = properties.municipalitycode
    result.oldmunicipalitycode = properties.oldmunicipalitycode
    result.departmentcode = properties.departmentcode
    result.districtcode = properties.districtcode
    result.section = properties.section
    result.category = properties.category
    result.zipcode = properties.zipcode
    result.truegeometry = properties.truegeometry
    result.number = properties.number
    result.sheet = properties.sheet
    result._type = properties._type
  } else {
    result.fulltext = item.fulltext
    result.city = item.city
    result.citycode = item.citycode
    result.postcode = item.postcode
    result.country = item.country
    result.zipcode = item.zipcode
    result.poiType = item.poiType
  }

  return result
}

for (const [route, routeRequests] of Object.entries(requests)) {
  for (const r of routeRequests) {
    test(`Test: ${route}${r.request}`, async t => {
      const url = API_TEST_URL + route + r.request
      const responses = await got.get(url).json()

      t.truthy(responses)

      const results = responses.error
        ? `Error: ${responses.error}`
        : responses[route === '/search' || route === '/reverse' ? 'features' : 'results'].map(item =>
          getResults(item, route)
        )

      t.truthy(results)

      if (route === '/search' || route === '/reverse') {
        t.true(results[0]?.id === r.results.firstResult.id)
      } else if (route === '/completion') {
        t.true(results[0]?.fulltext === r.results.firstResult.fulltext)
      }

      if (r.results.only) {
        const filters = Object.keys(r.results.only)

        for (const result of results) {
          for (const filter of filters) {
            t.is(result[filter], r.results.only[filter])
          }
        }
      }

      if (r.results.hasProperties) {
        const filters = r.results.hasProperties

        for (const result of results) {
          for (const filter of filters) {
            t.true(Object.keys(result).includes(filter))
          }
        }
      }

      if (r.results.many) {
        const filters = Object.keys(r.results.many)

        for (const result of results) {
          for (const filter of filters) {
            if (filter === 'terr') {
              const codeDepartement = result.zipcode < '97' ? result.zipcode.slice(0, 2) : result.zipcode.slice(0, 3)

              t.true(r.results.many[filter].includes(codeDepartement))
            } else {
              t.true(r.results.many[filter].includes(result[filter]))
            }
          }
        }
      }

      if (r.results.including) {
        const filters = Object.keys(r.results.including)

        for (const result of results) {
          for (const filter of filters) {
            t.true(result[filter].includes(r.results.including[filter]))
          }
        }
      }

      if (r.results.nbResult) {
        t.is(results.length, r.results.nbResult)
      }
    })
  }
}
