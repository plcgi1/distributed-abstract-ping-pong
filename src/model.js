const redis = require('./helpers/redis')
const getTime = require('./helpers/time')

class Model {
  constructor () {
    this.lastGeneratorTime = 'lasttime'
    this.generatorsListName = 'generators'
    this.handlersListName = 'handlers'
    this.messageCounterName = 'messages'
    this.errorsKey = 'errors'
  }

  async getList (key) {
    try {
      let list = await redis.get(key)

      const result = list ? JSON.parse(list) : []

      return result
    } catch (error) {
      throw new Error(error)
    }
  }

  async getGenerators () {
    const result = await this.getList(this.generatorsListName)

    return result
  }

  async getHandlers () {
    const result = await this.getList(this.handlersListName)

    return result
  }

  async getLatestGeneratorTime () {
    const result = await redis.get(this.lastGeneratorTime)
    return result
  }

  async setLatestGeneratorTime () {
    const time = getTime()
    await redis.set(this.lastGeneratorTime, time)
  }

  async add (key, row) {
    const list = await this.getList(key)

    const newRow = { id: list.length, ...row }
    list.push(newRow)

    const string = JSON.stringify(list)

    await redis.set(key, string)

    return newRow
  }

  async addGenerator (row) {
    const result = await this.add(this.generatorsListName, row)
    return result
  }

  async addHandler (row) {
    const result = await this.add(this.handlersListName, row)
    return result
  }

  async addError (message) {
    await redis.rpush(this.errorsKey, message)
  }

  async remove (key, id = 0) {
    const list = await this.getList(key)
    const result = list.filter(row => row.id !== id)

    const string = JSON.stringify(result)

    await redis.set(key, string)
  }

  async removeGenerator () {
    await this.remove(this.generatorsListName)
  }

  async removeHandler (id) {
    await this.remove(this.handlersListName, id)
  }

  async incrMessage () {
    await redis.incr(this.messageCounterName)
  }
}

module.exports = Model
