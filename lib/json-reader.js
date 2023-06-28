import {readFile} from 'node:fs/promises'

export default function readJsonFile(path) {
  const data = readFile(path, {encoding: 'utf8'})

  return JSON.parse(data)
}
