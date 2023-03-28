import validateParams from '../validate-params.js'
import search from '../api-addok-server.js'

export default function createAddressIndex(query) {
  validateParams({params: query})

  return search(query)
}
