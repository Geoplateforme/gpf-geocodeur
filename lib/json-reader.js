import {readFile} from 'node:fs/promises'

function readJsonFile(path) {
  const url = new URL(path, import.meta.url)

  try {
    const data = readFile(url, {encoding: 'utf8'})

    return JSON.parse(data)
  } catch (error) {
    console.log(error)
  }
}

export default readJsonFile
