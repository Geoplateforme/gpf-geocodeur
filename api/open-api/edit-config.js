import {readFile} from 'node:fs/promises'

export async function editConfig(yamlPath, apiUrl) {
  const yamlContent = await readFile(yamlPath, {encoding: 'utf8'})
  return yamlContent.replace('$API_URL', apiUrl)
}
