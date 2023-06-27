import {PARAMS} from '../params/base.js'
import getParcelIndexes from '../../indexes/parcel/parcel-capabilities.js'
import getAddressIndexes from '../../indexes/address/address-capabilities.js'
import getPOICapabilities from '../../indexes/poi/poi-capabilities.js'

export default function computeGeocodageCapabilities() {
  const {searchParameters, reverseParameters} = groupParamsByOperation()
  const parcelIndexes = getParcelIndexes()
  const addressIndexes = getAddressIndexes()
  const poiIndexes = getPOICapabilities()

  return {
    info: {
      name: 'Géocodage',
      url: '',
      description: 'Service de géocodage et géocodage inverse.'
    },
    api: {
      name: 'rest',
      version: '1.0.0'
    },
    operations: [
      {
        id: 'search',
        description: 'fournit les coordonnées géographiques d\'un lieu (adresse, point d\'intérêt, parcelle cadastrale...)',
        url: '/search',
        methods: [
          'GET'
        ],
        parameters: searchParameters
      },
      {
        id: 'reverse',
        description: 'fournit des lieux (adresse, point d\'intérêt, parcelle cadastrale...) à partir de coordonnées géographiques',
        url: '/reverse',
        methods: [
          'GET'
        ],
        parameters: reverseParameters
      }
    ],
    indexes: [
      addressIndexes,
      poiIndexes,
      parcelIndexes
    ]
  }
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
      default: PARAMS[k].default,
      schema: {
        type: type === 'float' ? 'number' : type,
        example,
        enum: nameInQuery === 'index' ? allowedValues : undefined
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
