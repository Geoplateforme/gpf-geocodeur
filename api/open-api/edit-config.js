import {readFile} from 'node:fs/promises'

const configCache = {}

const FIVE_MINUTES = 5 * 60 * 1000

export async function editConfig(yamlPath, apiUrl = '') {
  if (configCache[yamlPath] && (Date.now() - configCache[yamlPath].date < FIVE_MINUTES)) {
    return configCache[yamlPath].editedConfig
  }

  const openApiConfig = await readFile(yamlPath, {encoding: 'utf8'})
  const editedConfig = openApiConfig.replace('$API_URL', apiUrl)

  configCache[yamlPath] = {
    editedConfig,
    date: Date.now()
  }

  return editedConfig
}
