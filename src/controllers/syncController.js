const {
  PAYMENT_STATUSES,
  PAYMENT_STATUS_REASONS
} = require('config')
const logger = require('../util/logger')
const paymentInformixService = require('../services/paymentInformixService')

// let running = false

async function processV5OnHoldPayments () {
  const queuedPayments = await paymentInformixService.getV5PaymentsOnHold()
  if (queuedPayments.length <= 0) {
    // running = false
    logger.info(`Sync :: 0 Payments with status of On Hold (${PAYMENT_STATUSES.ON_HOLD}) for sync`)
    // break
    return true
  } else {
    logger.debug(`syncV5OnHoldPayments :: Syncing [${queuedPayments.length}] Payments`)
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

      return true
    } catch (e) {
      logger.error(`Main Catch ${e}`)
    }
  }
}

async function processAccruingPayments () {
  const queuedUserIds = await paymentInformixService.getUserIdsWithPaymentsAccruing()
  if (queuedUserIds.length <= 0) {
    // running = false
    logger.info(`Sync :: 0 Payments with status of Accruing (${PAYMENT_STATUSES.ACCRUING}) for sync`)
    // break
    return true
  } else {
    logger.debug(`syncAccruingPayments :: Syncing [${queuedUserIds.length}] Payments`)
    try {
      for (let i = 0; i < queuedUserIds.length; i += 1) {
        const userId = queuedUserIds[i]
        const accrualThreshold = await paymentInformixService.getUsersAccrualThreshold(userId)
        const totalAccruing = await paymentInformixService.getTotalUserPaymentsAccruing(userId)
        logger.debug(`processAccruingPayments - UserID: ${userId} Accrual Threshold: ${accrualThreshold} Total Accruing: ${totalAccruing}`)
        if (totalAccruing >= accrualThreshold) {
          logger.debug(`processAccruingPayments - Releasing Payments for UserID: ${userId}`)
          await paymentInformixService.releaseAccruingPayments(userId)
        }
      }
      return true
    } catch (e) {
      logger.error(`Main Catch ${e}`)
    }
  }
}

module.exports = {
  processV5OnHoldPayments,
  processAccruingPayments
}
