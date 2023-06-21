import path from 'node:path'
import {execa} from 'execa'
import {createInstance as createRedisServer} from './redis.js'

export async function createImporter(destPath, addokConfigFile) {
  destPath = path.resolve(destPath)
  addokConfigFile = path.resolve(addokConfigFile)

  const redisServer = await createRedisServer(destPath, {dropExistingDump: true})

  console.log(' * Started Redis server')

  const addokEnv = {
    ADDOK_CONFIG_FILE: path.resolve(addokConfigFile),
    REDIS_UNIX_SOCKET_PATH: redisServer.socketPath
  }

  async function finish() {
    console.log(' * Computing ngrams…')
    await execa('addok', ['ngrams'], {env: addokEnv})

    console.log(' * Dumping Redis database on disk…')
    await redisServer.close({save: true})
  }

  async function batchImport(readableStream) {
    await execa('addok', ['batch'], {env: addokEnv, input: readableStream})
  }

  return {
    batchImport,
    finish
  }
}
