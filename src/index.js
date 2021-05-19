/**
 * The API entry point
 */
global.Promise = require('bluebird')
const config = require('config')
const schedule = require('node-schedule')
const healthcheck = require('topcoder-healthcheck-dropin')
const logger = require('./util/logger')
const syncController = require('./controllers/syncController')

process.on('unhandledRejection', (reason, p) => {
  logger.warn(`Unhandled Rejection at: Promise ${p} ${JSON.stringify(p)} reason: ${reason} ${JSON.stringify(reason)}`)
  // application specific logging, throwing an error, or other logic here
})

if (config.PROCESS_ON_HOLD_ENABLED === true) {
  const syncRule = new schedule.RecurrenceRule()
  syncRule.minute = new schedule.Range(0, 59, config.PROCESS_ON_HOLD_INTERVAL)
  schedule.scheduleJob(syncRule, syncController.processV5OnHoldPayments)
  logger.info(`processV5OnHoldPayments to be executed every ${config.PROCESS_ON_HOLD_INTERVAL} minutes`)
} else {
  logger.info(`processV5OnHoldPayments Disabled by Config: ${config.PROCESS_ON_HOLD_ENABLED}`)
}

if (config.PROCESS_ACCRUING_ENABLED === true) {
  const syncRule = new schedule.RecurrenceRule()
  syncRule.minute = new schedule.Range(0, 59, config.PROCESS_ACCRUING_INTERVAL)
  schedule.scheduleJob(syncRule, syncController.processAccruingPayments)
  logger.info(`processAccruingPayments to be executed every ${config.PROCESS_ACCRUING_INTERVAL} minutes`)
} else {
  logger.info(`processAccruingPayments Disabled by Config: ${config.PROCESS_ACCRUING_ENABLED}`)
}

const check = () => {
  return true
}

healthcheck.init([check])
