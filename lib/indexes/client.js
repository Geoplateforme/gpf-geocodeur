import {Agent as HttpAgent} from 'node:http'
import {Agent as HttpsAgent} from 'node:https'
import got from 'got'

export function createClient({indexUrl}) {
  const agent = {
    http: new HttpAgent({keepAlive: true, keepAliveMsecs: 1000}),
    https: new HttpsAgent({keepAlive: true, keepAliveMsecs: 1000})
  }

  return {
    execRequest(operation, body) {
      return got({
        url: `${indexUrl}/${operation}`,
        method: 'POST',
        responseType: 'json',
        resolveBodyOnly: true,
        decompress: true,
        agent,
        json: body
      })
    }
  }
}
