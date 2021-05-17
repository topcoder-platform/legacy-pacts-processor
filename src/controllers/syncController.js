const {
  PAYMENT_STATUSES,
  PAYMENT_STATUS_REASONS
} = require('config')
const logger = require('../util/logger')
const paymentInformixService = require('../services/paymentInformixService')

let running = false

async function syncOpenPayments () {
  const queuedPayments = await paymentInformixService.getOpenPayments();
  if (queuedPayments.length <= 0) {
    running = false
    logger.info(`Sync :: 0 Payments with status of ${PAYMENT_STATUSES.ON_HOLD} for sync`)
    // break
  } else {
    logger.debug(`Sync :: Syncing [${queuedPayments.length}] Payments`)
    try {
      for (let i = 0; i < queuedPayments.length; i += 1) {
        const item = queuedPayments[i]
        const taxFormExists = await paymentInformixService.getTaxStatusForUserId(item.user_id)
        logger.debug(`taxFormExists Repsonse: ${JSON.stringify(taxFormExists)}`)

        if (taxFormExists.length > 0) {
          await paymentInformixService.updatePaymentStatus(
            item.payment_detail_id,
            PAYMENT_STATUSES.OWED
          )
        } else {
          await paymentInformixService.updatePaymentStatus(
            item.payment_detail_id,
            PAYMENT_STATUSES.ON_HOLD,
            PAYMENT_STATUS_REASONS.WAITING_FOR_TAX_FORM
          )
        }
      }
    } catch (e) {
      logger.error(`Main Catch ${e}`)
    }
  }
}

module.exports = {
  syncOpenPayments,
}
