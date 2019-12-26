const redis = require('./helpers/redis')

class Queue {
  constructor () {
    this.queueName = 'queue'
  }
  async publish (number) {
    await redis.rpush(this.queueName, number)
  }

  async getTask () {
    const result = await redis.rpop(this.queueName)

    return result
  }
}

module.exports = Queue
