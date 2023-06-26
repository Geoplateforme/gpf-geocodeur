import {groupParamsByOperation} from '../api/params/base.js'
import getParcelIndexes from '../indexes/parcel-indexes.js'
import getAddressIndexes from '../indexes/address-indexes.js'

export default function computeGeocodageCapabilities() {
  const {searchParameters, reverseParameters} = groupParamsByOperation()
  const parcelIndexes = getParcelIndexes()
  const addressIndexes = getAddressIndexes()

  return {
    info: {
      name: 'Géocodage',
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
      parcelIndexes
    ]
  }
}
