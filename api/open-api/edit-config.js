import {readFile} from 'node:fs/promises'

const configCache = {}

export async function editConfig(yamlPath, apiUrl = '') {
  if (configCache[yamlPath]) {
    return configCache[yamlPath].editedConfig
  }

  const openApiConfig = await readFile(yamlPath, {encoding: 'utf8'})
  const editedConfig = openApiConfig.replace('$API_URL', apiUrl)

  configCache[yamlPath] = {
    editedConfig
  }

  return editedConfig
}
