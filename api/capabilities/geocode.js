import {PARAMS} from '../params/base.js'
import readJson from '../../lib/read-json.js'

export default async function computeGeocodeCapabilities() {
  const {searchParameters, reverseParameters} = groupParamsByOperation()
  const infosCapabilities = await readJson('./config/capabilities/geocode.json')
  const addressCapabilities = await readJson('./config/capabilities/address.json')
  const parcelCapabilities = await readJson('./config/capabilities/parcel.json')
  const poiCapabilities = await readJson('./config/capabilities/poi.json')

  infosCapabilities.operations[0].parameters = searchParameters
  infosCapabilities.operations[1].parameters = reverseParameters
  infosCapabilities.indexes = [addressCapabilities, poiCapabilities, parcelCapabilities]

  return infosCapabilities
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
