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
const logger = require('./util/logger')
const syncController = require('./controllers/syncController')

process.on('unhandledRejection', (reason, p) => {
  logger.warn(`Unhandled Rejection at: Promise ${p} ${JSON.stringify(p)} reason: ${reason} ${JSON.stringify(reason)}`)
  // application specific logging, throwing an error, or other logic here
})

if (config.SYNC_ENABLED === true) {
  const syncRule = new schedule.RecurrenceRule()
  syncRule.minute = new schedule.Range(0, 59, config.SYNC_INTERVAL)
  schedule.scheduleJob(syncRule, syncController.syncPactsPayments)
  logger.info(`The sync is scheduled to be executed every ${config.SYNC_INTERVAL} minutes`)
} else {
  logger.info(`Sync Disabled by Config: ${config.SYNC_ENABLED}`)
}

// const app = express()
// app.use(cors({
//   exposedHeaders: [
//     'X-Prev-Page',
//     'X-Next-Page',
//     'X-Page',
//     'X-Per-Page',
//     'X-Total',
//     'X-Total-Pages',
//     'Link'
//   ]
// }))

// setup express app
// app.set('port', config.PORT)

// serve challenge V5 API swagger definition
// const swaggerRoute = '/v5/challenge-migration/docs'
// app.use(swaggerRoute, swaggerUi.serve, swaggerUi.setup(apiSwaggerDoc))
// logger.info(`Swagger doc is available at ${swaggerRoute}`)

// intercept the response body from jwtAuthenticator
// app.use(interceptor((req, res) => {
//   return {
//     isInterceptable: () => {
//       return res.statusCode === 403
//     },

//     intercept: (body, send) => {
//       let obj
//       try {
//         obj = JSON.parse(body)
//       } catch (e) {
//         logger.error('Invalid response body.')
//       }
//       if (obj && obj.result && obj.result.content && obj.result.content.message) {
//         const ret = { message: obj.result.content.message }
//         res.statusCode = 401
//         send(JSON.stringify(ret))
//       } else {
//         send(body)
//       }
//     }
//   }
// }))

// Register routes
// require('./app-routes')(app)

// the topcoder-healthcheck-dropin library returns checksRun count,
// here it follows that to return such count
// let checksRun = 0

// app.get(`/${config.API_VERSION}/challenge-migration/health`, (req, res) => {
//   // checksRun += 1
//   // if (!migration.isHealthy()) return res.sendStatus(503)
//   res.json({ success: true })
// })

// The error handler
// eslint-disable-next-line no-unused-vars
// app.use((err, req, res, next) => {
//   logger.logFullError(err)
//   res.sendStatus(500)
// })

// app.listen(app.get('port'), () => {
//   logger.info(`Express server listening on port ${app.get('port')}`)
// })

// module.exports = app
