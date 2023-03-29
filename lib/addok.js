import got from 'got'

export default async function createAddokClient(addokUrl, filters) {
  const instance = got.extend({
    prefixUrl: addokUrl,
    responseType: 'json',
    searchParams: filters
  })

  async function search(query) {
    const response = await instance.get('search', {
      searchParams: {
        q: query
      }
    })

    return response.body
  }

  return {search}
}
