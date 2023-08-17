import {readFile} from 'node:fs/promises'

let _openApiConfig = null
let _openApiConfigDate = null

const FIVE_MINUTES = 5 * 60 * 1000

export async function editConfig(yamlPath, apiUrl = '') {
  if (_openApiConfig && (Date.now() - _openApiConfigDate < FIVE_MINUTES)) {
    return _openApiConfig.replace('$API_URL', apiUrl)
  }

  const openApiConfig = await readFile(yamlPath, {encoding: 'utf8'})

  _openApiConfig = openApiConfig
  _openApiConfigDate = Date.now()

  return openApiConfig.replace('$API_URL', apiUrl)
}
