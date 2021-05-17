/**
 * The API entry point
 */
global.Promise = require('bluebird')
const config = require('config')
const schedule = require('node-schedule')
// const express = require('express')
// const cors = require('cors')
// const _ = require('lodash')
// const interceptor = require('express-interceptor')
const healthcheck = require('topcoder-healthcheck-dropin')
const logger = require('./util/logger')
const syncController = require('./controllers/syncController')

process.on('unhandledRejection', (reason, p) => {
  logger.warn(`Unhandled Rejection at: Promise ${p} ${JSON.stringify(p)} reason: ${reason} ${JSON.stringify(reason)}`)
  // application specific logging, throwing an error, or other logic here
})

if (config.SYNC_ENABLED === true) {
  const syncRule = new schedule.RecurrenceRule()
  syncRule.minute = new schedule.Range(0, 59, config.SYNC_INTERVAL)
  schedule.scheduleJob(syncRule, syncController.syncOpenPayments)
  logger.info(`The sync is scheduled to be executed every ${config.SYNC_INTERVAL} minutes`)
} else {
  logger.info(`Sync Disabled by Config: ${config.SYNC_ENABLED}`)
}

// syncController.syncOpenPayments()

const check = () => {
  return true
}

healthcheck.init([check])
