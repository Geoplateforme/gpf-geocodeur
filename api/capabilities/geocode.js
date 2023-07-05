import {PARAMS} from '../params/base.js'
import readJson from '../../lib/read-json.js'
import process from 'node:process'

let _capabilities = null

export default async function computeGeocodeCapabilities() {
  if (_capabilities) {
    return _capabilities
  }

  const {searchParameters, reverseParameters} = groupParamsByOperation()
  const capabilities = await readJson('./config/capabilities/geocode/base.json')
  const addressCapabilities = await readJson('./config/capabilities/geocode/address.json')
  const parcelCapabilities = await readJson('./config/capabilities/geocode/parcel.json')
  const poiCapabilities = await readJson('./config/capabilities/geocode/poi.json')
  const categories = await getCategories()

  poiCapabilities.fields[0].values = categories

  capabilities.operations[0].parameters = searchParameters
  capabilities.operations[1].parameters = reverseParameters
  capabilities.indexes = [addressCapabilities, poiCapabilities, parcelCapabilities]

  _capabilities = capabilities
  return capabilities
}

function groupParamsByOperation() {
  const searchParameters = []
  const reverseParameters = []

  for (const k of Object.keys(PARAMS)) {
    const {nameInQuery, description, required, type, example, allowedValues} = PARAMS[k]

    const capabilitiesParams = {
      name: nameInQuery || k,
      in: 'query',
      description,
      required: required || false,
      default: PARAMS[k].defaultValue,
      schema: {
        type: type === 'float' ? 'number' : type,
        example,
        enum: (nameInQuery === 'index' || k === 'type') ? allowedValues : undefined
      }
    }

    const {operation} = PARAMS[k]

    if (!operation || operation === 'search') {
      searchParameters.push(capabilitiesParams)
    }

    if (!operation || operation !== 'search') {
      reverseParameters.push(capabilitiesParams)
    }
  }

  return {
    searchParameters,
    reverseParameters
  }
}

async function getCategories() {
  const response = await fetch(`${process.env.POI_INDEX_URL}/categories`)

  return response.json()
}
