import got from 'got'
import process from 'node:process'
import {AUTOCOMPLETE} from '../params/autocomplete.js'
import readJson from '../../lib/read-json.js'

let _capabilities = null
let _capabilitiesDate = null

const FIVE_MINUTES = 5 * 60 * 1000

export default async function computeAutocompleteCapabilities() {
  if (_capabilities && (Date.now() - _capabilitiesDate < FIVE_MINUTES)) {
    return _capabilities
  }

  const parameters = computeParameters()
  const capabilities = await readJson('./config/capabilities/autocomplete/base.json')
  const addressCapabilities = await readJson('./config/capabilities/autocomplete/address.json')
  const poiCapabilities = await readJson('./config/capabilities/autocomplete/poi.json')
  const categories = await getCategories()

  poiCapabilities.fields[0].values = categories

  capabilities.operations[0].parameters = parameters
  capabilities.indexes = [addressCapabilities, poiCapabilities]

  _capabilities = capabilities
  _capabilitiesDate = Date.now()

  return capabilities
}

function computeParameters() {
  const parameters = []

  for (const key of Object.keys(AUTOCOMPLETE)) {
    const {type, required, description, example} = AUTOCOMPLETE[key]

    const capabilitiesParams = {
      name: key,
      in: 'query',
      description,
      required: required || false,
      default: AUTOCOMPLETE[key].defaultValue,
      schema: {
        type,
        example
      }
    }

    parameters.push(capabilitiesParams)
  }

  return parameters
}

async function getCategories() {
  const data = await got.get(`${process.env.POI_INDEX_URL}/categories`).json()

  return data
}
