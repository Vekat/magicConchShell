const w = require('winston')

const environmentLogLevel = process.env.LOG_LEVEL || 'debug'

const config = {
  timestamp: () => (new Date()).toISOString(),
  formatter: (i) => `${i.timestamp()} [${i.level}] :: ${i.message || '--'}`
}

const logger = new w.Logger({
  level: environmentLogLevel,
  transports: [
    new w.transports.Console(config),
    new w.transports.File(Object.assign({ filename: 'combined.log' }, config))
  ]
})

module.exports = logger
