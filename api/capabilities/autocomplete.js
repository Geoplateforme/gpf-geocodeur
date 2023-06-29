import {AUTOCOMPLETE} from '../params/autocomplete.js'
import readJson from '../../lib/read-json.js'

export default async function computeAutocompleteCapabilities() {
  const parameters = computeParameters()
  const capabilities = await readJson('./config/capabilities/autocomplete/base.json')
  const addressCapabilities = await readJson('./config/capabilities/autocomplete/address.json')
  const poiCapabilities = await readJson('./config/capabilities/autocomplete/poi.json')

  capabilities.operations[0].parameters = parameters
  capabilities.indexes = [addressCapabilities, poiCapabilities]

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

