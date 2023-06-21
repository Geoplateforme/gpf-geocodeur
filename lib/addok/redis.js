import process from 'node:process'
import path from 'node:path'
import {setTimeout} from 'node:timers/promises'
import {mkdir, rm} from 'node:fs/promises'
import {execa} from 'execa'
import {customAlphabet} from 'nanoid'
import Redis from 'ioredis'

const nanoid = customAlphabet('1234567890abcdef')

const PIDS_PATH = path.resolve('.', 'pids')

export async function createInstance(basePath, options = {}) {
  basePath = path.resolve(basePath)

  await mkdir(PIDS_PATH, {recursive: true})
  const redisSocketPath = path.join(PIDS_PATH, `redis-${process.pid}-${nanoid(4)}.sock`)

  await mkdir(basePath, {recursive: true})

  if (options.dropExistingDump) {
    await rm(path.join(basePath, 'dump.rdb'), {force: true})
  }

  const instance = execa('redis-server', ['--save', '""', '--unixsocket', redisSocketPath, '--dir', basePath])
  instance.stdout.pipe(process.stdout)

  // Waiting for redis-server availability
  await new Promise((resolve, reject) => {
    function onData(data) {
      if (data.includes('Ready to accept connections')) {
        instance.stdout.off('data', onData)
        resolve()
      }
    }

    instance.stdout.on('data', onData)

    setTimeout(() => {
      instance.stdout.off('data', onData)
      reject(new Error('redis-server init timeout'))
    }, 5000)
  })

  return {
    async close(options = {}) {
      if (options.save) {
        const client = new Redis(redisSocketPath)
        await client.save()
        await client.quit()
      }

      instance.kill()
    },

    socketPath: redisSocketPath
  }
}
