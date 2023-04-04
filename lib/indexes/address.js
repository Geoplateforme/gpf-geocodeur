import process from 'node:process'
import {Agent as HttpAgent} from 'node:http'
import {Agent as HttpsAgent} from 'node:https'
import {pick} from 'lodash-es'
import got from 'got'

const {ADDRESS_ADDOK_SERVER_URL} = process.env

const SEARCH_PARAMS = [
  'q',
  'limit',
  'type',
  'lon',
  'lat',
  'type',
  'citycode',
  'postcode'
]

const REVERSE_PARAMS = [
  'limit',
  'type',
  'lon',
  'lat',
  'type',
  'citycode',
  'postcode'
]

export default function createAddressIndex(options = {}) {
  const addokServerUrl = options.addokServerUrl || ADDRESS_ADDOK_SERVER_URL
  const agent = {
    http: new HttpAgent({keepAlive: true, keepAliveMsecs: 1000}),
    https: new HttpsAgent({keepAlive: true, keepAliveMsecs: 1000})
  }
  const execRequest = got.extend({
    prefixUrl: addokServerUrl,
    responseType: 'json',
    resolveBodyOnly: true,
    decompress: true,
    agent
  })

  return {
    async search(params) {
      const searchParams = pick(params, SEARCH_PARAMS)
      const result = await execRequest('search', {searchParams})
      return result.features
    },

    async reverse(params) {
      const searchParams = pick(params, REVERSE_PARAMS)
      const result = await execRequest('reverse', {searchParams})
      return result.features
    }
  }
}
