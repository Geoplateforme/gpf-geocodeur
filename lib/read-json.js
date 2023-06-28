import {readFile} from 'node:fs/promises'

export default async function readJson(path) {
  const data = await readFile(path, {encoding: 'utf8'})
  return JSON.parse(data)
}
