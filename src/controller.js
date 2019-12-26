const logger = require('./helpers/logger')
const getTime = require('./helpers/time')
const { STATE } = require('./helpers/enums')
const os = require('os')
const Model = require('./model')
const Queue = require('./queue')

class Controller {
  constructor ({ hint = 5, gint = 10, ngtimeout = 100 }) {
    this.handlerInterval = hint * 1000
    this.generateInterval = gint * 1000
    this.noGeneratorTimeout = ngtimeout * 1000
    this.model = new Model()
    this.queue = new Queue()
  }

  async run () {
    logger.info('Controller started')

    const generators = await this.model.getGenerators()

    if (generators.length === 0) {
      await this.model.setLatestGeneratorTime()
      await this.generator()

      return
    }

    await this.handler()
  }

  async generator () {
    // используется в unregister
    this.state = STATE.generator

    logger.info('run as generator')

    await this.model.addGenerator({ host: os.hostname() })

    setInterval(
      async () => {
        await this.model.setLatestGeneratorTime()

        const number = Math.floor(Math.random() * Math.floor(10))

        console.info(`${this.state}.Published`, number)

        this.queue.publish(number)
      },
      this.generateInterval
    )
  }

  async handler () {
    // используется в unregister
    this.state = STATE.handler

    logger.info('run as handler')

    const timerId = setInterval(
      async () => {
        // check not existent generator by time
        const time = getTime()

        const latestGeneratorTime = await this.model.getLatestGeneratorTime()
        const generators = await this.model.getGenerators()
        const ifRunGenerator = (latestGeneratorTime && (time - latestGeneratorTime) > this.noGeneratorTimeout)
        const noGenerators = (generators.length === 0)

        if (ifRunGenerator || noGenerators) {
          clearInterval(timerId)

          await this.generator()

          return
        }

        const newHandler = await this.model.addHandler({ host: os.hostname() })

        // используется в unregister
        this.handlerId = newHandler.id

        const number = await this.queue.getTask()
        if (!number) {
          console.info(`${this.state}.Skip with ${number}`)
          return
        }
        console.info(`${this.state}.number: ${number}`)

        if (number > 8) {
          await this.model.addError(`${this.state}.Error: ${number}`)
          console.info(`${this.state}.Error added`)
        } else {
          this.model.incrMessage()
          console.info(`${this.state}.Messages incremented`)
        }
      },
      this.handlerInterval
    )
  }

  async unregister () {
    try {
      if (this.state === STATE.generator) {
        await this.model.removeGenerator()
      } else {
        await this.model.removeHandler(this.handlerId)
      }

      logger.info(`${this.state} finished`)
    } catch (error) {
      throw new Error(error)
    }
  }
}

module.exports = Controller
