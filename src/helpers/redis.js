const Redis = require('ioredis')
const logger = require('./logger')
const config = require('../config')

let client

const init = () => {
  if (!client) {
    client = new Redis(config.redis.port, config.redis.host)
  }

  const onConnect = () => {
    logger.info(`Redis connected`)
  }
  client.on('connect', onConnect)

  const onError = (err) => {
    logger.error('Error.Redis %o', err)
    process.exit(-1)
  }

  client.on('error', onError)

  return client
}

module.exports = init()
