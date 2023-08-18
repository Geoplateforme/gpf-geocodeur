import {readFile} from 'node:fs/promises'

const configCache = {}

const FIVE_MINUTES = 5 * 60 * 1000

export async function editConfig(yamlPath, apiUrl = '') {
  if (configCache[yamlPath] && (Date.now() - configCache[yamlPath].date < FIVE_MINUTES)) {
    const openApiConfig = await readFile(yamlPath, {encoding: 'utf8'})
    return openApiConfig.replace('$API_URL', apiUrl)
  }

  const openApiConfig = await readFile(yamlPath, {encoding: 'utf8'})

  configCache[yamlPath] = {
    content: openApiConfig,
    date: Date.now()
  }

  return openApiConfig.replace('$API_URL', apiUrl)
}
