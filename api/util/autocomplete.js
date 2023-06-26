import {getCoordinates} from './coordinates.js'

const AUTOCOMPLETE_INDEXES = {
  StreetAddress: 'address',
  PositionOfInterest: 'poi'
}

export function formatAutocompleteParams(params) {
  const coordinates = getCoordinates(params)

  const formattedParams = {
    q: params.text,
    autocomplete: true
  }

  formattedParams.indexes = params.type.map(v => AUTOCOMPLETE_INDEXES[v])
  formattedParams.limit = params.maximumResponses

  if (coordinates) {
    formattedParams.lon = coordinates[0]
    formattedParams.lat = coordinates[1]
  }

  return formattedParams
}

export function formatResult(params, features) {
  const {indexes} = params
  const autocompleteResult = []

  if (indexes.includes('address')) {
    for (const feature of features) {
      const {properties} = feature

      autocompleteResult.push({
        country: 'StreetAddress',
        city: properties.city,
        zipcode: properties.postcode,
        street: properties.street,
        metropole: properties.citycode.slice(0, 2) !== '97',
        fulltext: `${properties.name}, ${properties.postcode} ${properties.city}`,
        x: properties.x,
        y: properties.y
      })
    }
  }

  return autocompleteResult
}
