const args = require('minimist')(process.argv.slice(2))
const logger = require('./src/helpers/logger')
const Controller = require('./src/controller')

if (args.help) {
  help()
  process.exit(0)
}

logger.info('App started')

const controller = new Controller(args)

controller.run()

function help() {
  console.info('help - print help')
  console.info('hint - runs handler with this interval, default value 10 sec')
  console.info('gint - runs generator with this interval, default value 10 sec')
  console.info('ngtimeout - alert timeout without any generator in system, default 100 sec')
}

const onTerminate = async () => {
  await controller.unregister()
  process.exit()
}
process.on('SIGINT', onTerminate)
process.on('SIGTERM', onTerminate)

process.on('uncaughtException', (err) => {
  logger.error('uncaughtException: ', err.message)
  process.exit(1)
})
