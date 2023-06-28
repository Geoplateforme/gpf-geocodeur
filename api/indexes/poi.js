import process from 'node:process'
import {Agent as HttpAgent} from 'node:http'
import {Agent as HttpsAgent} from 'node:https'
import {pick} from 'lodash-es'
import got from 'got'

const {POI_INDEX_URL} = process.env

const FILTERS = [
  'citycode',
  'postcode',
  'category'
]

function prepareRequest(params) {
  const filters = pick(params, FILTERS)
  const center = params.lon !== undefined && params.lat !== undefined
    ? [params.lon, params.lat]
    : undefined

  return {
    q: params.q,
    center,
    filters,
    limit: params.limit || 10,
    geometry: params.geometry,
    autocomplete: params.autocomplete
  }
}

export default function createPoiIndex(options = {}) {
  const poiIndexUrl = options.poiIndexUrl || POI_INDEX_URL

  const agent = {
    http: new HttpAgent({keepAlive: true, keepAliveMsecs: 1000}),
    https: new HttpsAgent({keepAlive: true, keepAliveMsecs: 1000})
  }

  const execRequest = got.extend({
    prefixUrl: poiIndexUrl,
    method: 'POST',
    responseType: 'json',
    resolveBodyOnly: true,
    decompress: true,
    agent
  })

  return {
    async search(params) {
      const requestBody = prepareRequest(params)
      return execRequest('search', {json: requestBody})
    },

    async reverse(params) {
      const requestBody = prepareRequest(params)
      return execRequest('reverse', {json: requestBody})
    },

    async autocomplete(params) {
      const requestBody = prepareRequest(params)
      return execRequest('search', {json: requestBody})
    }
  }
}
