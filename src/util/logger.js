/**
 * winston logger configuration.
 */

const util = require('util')
const config = require('config')
const { createLogger, format, transports } = require('winston')

const logger = createLogger({
  level: config.LOG_LEVEL,
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        // format.timestamp(),
        format.align(),
        format.simple()
      )
    })
    // new transports.File({
    //   format: format.simple(),
    //   level: 'debug',
    //   filename: config.LOG_FILENAME
    // })
  ]
})

/**
 * Log error details with signature
 * @param err the error
 * @param signature the signature
 */
logger.logFullError = (err, signature) => {
  if (!err) {
    return
  }
  if (signature) {
    logger.error(`Error happened in ${signature}`)
  }
  logger.debug(util.inspect(err))
  if (!err.logged) {
    logger.debug(err.stack)
    err.logged = true
  }
}

module.exports = logger
