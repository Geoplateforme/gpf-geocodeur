import {AUTOCOMPLETE} from '../params/base.js'
import readJsonFile from '../../lib/json-reader.js'

export default function computeGeocodageCapabilities() {
  const parameters = []

  for (const key of Object.keys(AUTOCOMPLETE)) {
    const {type, required, array, description, example} = AUTOCOMPLETE[key]

    const capabilitiesParams = {
      name: key,
      in: 'query',
      description,
      required: required || false,
      array: array || false,
      default: AUTOCOMPLETE[key].defaultValue,
      schema: {
        type,
        example
      }
    }

    parameters.push(capabilitiesParams)
  }
}

