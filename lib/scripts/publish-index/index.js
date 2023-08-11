/* eslint no-await-in-loop: off */
import process from 'node:process'
import {Buffer} from 'node:buffer'
import {createGzip} from 'node:zlib'

import tarFs from 'tar-fs'
import {S3} from '@aws-sdk/client-s3'
import {Upload} from '@aws-sdk/lib-storage'

export function generateObjectKey(prefix = '', indexType) {
  const date = (new Date()).toISOString()
  return `${prefix}index-${indexType}-${date.slice(0, 10)}-${date.slice(11, 13)}-${date.slice(14, 16)}-${date.slice(17, 19)}.tar.gz`
}

export function generateLatestObjectKey(prefix = '', indexType) {
  return `${prefix}index-${indexType}-latest`
}

const region = process.env.S3_REGION
const endpoint = process.env.S3_ENDPOINT
const accessKeyId = process.env.S3_ACCESS_KEY
const secretAccessKey = process.env.S3_SECRET_KEY
const bucket = process.env.S3_BUCKET
const prefix = process.env.S3_PREFIX
const vhost = process.env.S3_VHOST

const client = new S3({
  region,
  endpoint,
  s3BucketEndpoint: true,
  credentials: {
    accessKeyId,
    secretAccessKey
  }
})

export async function packAndUpload(indexType, cwd) {
  const objectKey = generateObjectKey(prefix, indexType)

  const upload = new Upload({
    client,
    params: {
      Bucket: bucket,
      Key: objectKey,
      Body: tarFs.pack(cwd).pipe(createGzip()),
      ACL: 'public-read'
    }
  })

  await upload.done()

  return objectKey
}

export function computeArchiveUrl(objectKey) {
  if (!vhost) {
    return
  }

  return `${vhost}${objectKey}`
}

export async function updateLatestResolver(indexType, archiveUrl) {
  const objectKey = generateLatestObjectKey(prefix, indexType)

  const upload = new Upload({
    client,
    params: {
      Bucket: bucket,
      Key: objectKey,
      Body: Buffer.from(archiveUrl),
      ACL: 'public-read'
    }
  })

  await upload.done()
}
