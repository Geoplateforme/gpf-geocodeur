import search from '../api-addok-server.js'

export default function createAddressIndex(query) {
  return search(query)
}
