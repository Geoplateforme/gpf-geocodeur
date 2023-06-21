import process from 'node:process'
import path from 'node:path'
import {setTimeout} from 'node:timers/promises'
import {mkdir, rm} from 'node:fs/promises'
import {execa} from 'execa'
import Redis from 'ioredis'
import {customAlphabet} from 'nanoid'

const nanoid = customAlphabet('1234567890abcdef')

const PIDS_PATH = path.resolve('.', 'pids')

export async function createImporter(destPath, addokConfigFile) {
  await mkdir(PIDS_PATH, {recursive: true})
  const redisSocketPath = path.join(PIDS_PATH, `redis-${process.pid}-${nanoid(4)}.sock`)

  destPath = path.resolve(destPath)
  addokConfigFile = path.resolve(addokConfigFile)

  await mkdir(destPath, {recursive: true})
  await rm(path.join(destPath, 'dump.rdb'), {force: true})

  const redisServer = execa('redis-server', ['--save', '""', '--unixsocket', redisSocketPath, '--dir', destPath])
  redisServer.stdout.pipe(process.stdout)

  // Waiting for redis-server availability
  await new Promise((resolve, reject) => {
    function onData(data) {
      if (data.includes('Ready to accept connections')) {
        redisServer.stdout.off('data', onData)
        resolve()
      }
    }

    redisServer.stdout.on('data', onData)

    setTimeout(() => {
      redisServer.stdout.off('data', onData)
      reject(new Error('redis-server init timeout'))
    }, 5000)
  })

  console.log(' * Started Redis server')

  const redis = new Redis(redisSocketPath)

  const addokEnv = {
    ADDOK_CONFIG_FILE: path.resolve(addokConfigFile),
    REDIS_UNIX_SOCKET_PATH: redisSocketPath
  }

  async function finish() {
    console.log(' * Computing ngrams…')
    await execa('addok', ['ngrams'], {env: addokEnv})

    console.log(' * Dumping Redis database on disk…')
    await redis.save()

    await redis.quit()
    redisServer.kill()
  }

  async function batchImport(readableStream) {
    await execa('addok', ['batch'], {env: addokEnv, input: readableStream})
  }

  return {
    batchImport,
    finish
  }
}
