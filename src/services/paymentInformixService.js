// const _ = require('lodash')
const util = require('util')
const logger = require('../util/logger')
const helper = require('../common/helper')

const {
  PAYMENT_STATUSES,
  PAYMENT_STATUS_REASONS,
  TAX_FORM_STATUS
} = require('config')

/**
 * Prepare Informix statement
 * @param {Object} connection the Informix connection
 * @param {String} sql the sql
 * @return {Object} Informix statement
 */
async function prepare (connection, sql) {
  logger.debug(`Preparing SQL ${sql}`)
  const stmt = await connection.prepareAsync(sql)
  return Promise.promisifyAll(stmt)
}

/**
 Removed Columns
 pd.algorithm_round_id,
    pd.component_project_id,
    pd.cockpit_project_id,
    pd.algorithm_problem_id,
    pd.studio_contest_id,
    pd.component_contest_id,
    pd.digital_run_stage_id,
    pd.digital_run_season_id,
    pd.parent_payment_id,
    pd.total_amount,
    pd.installment_number,
    pd.digital_run_track_id,
    u.first_name,
    u.middle_name,
    u.last_name,
 */

const QUERY_GET_USERIDS_WITH_PAYMENT_STATUS_ACCRUING = `SELECT 
DISTINCT p.user_id
FROM payment p
  INNER JOIN payment_detail pd ON pd.payment_detail_id = p.most_recent_detail_id
WHERE p.create_date >= today -30 AND pd.payment_status_id = ${PAYMENT_STATUSES.ACCRUING}`

const QUERY_GET_USERS_ACCRUING_THRESHOLD = 'SELECT LIMIT 1 accrual_amount FROM user_accrual where user_id = %d'

const QUERY_GET_TOTAL_USER_ACCRUING_PAYMENTS = `select nvl(sum(pd.net_amount), 0) as total 
from payment p, payment_detail pd 
where p.user_id = %d
 and pd.payment_status_id = ${PAYMENT_STATUSES.ACCRUING}
 and p.most_recent_detail_id = pd.payment_detail_id`

const QUERY_GET_USER_PAYMENTS_ACCRUING = `select pd.payment_detail_id
from payment p, payment_detail pd 
where p.user_id = %d
 and pd.payment_status_id = ${PAYMENT_STATUSES.ACCRUING}
 and p.most_recent_detail_id = pd.payment_detail_id`

const QUERY_GET_PAYMENTS_ON_HOLD = `SELECT 
p.payment_id, pd.jira_issue_id, pd.payment_detail_id, pd.payment_desc, pd.payment_type_id, pd.payment_method_id, p.create_date, 
pd.create_date as modify_date, pt.payment_type_desc, pm.payment_method_desc, pd.net_amount, pd.payment_status_id, s.payment_status_desc,
p.user_id, u.handle, pd.date_modified, pd.date_paid, pd.gross_amount, nvl(pdsrx.payment_status_reason_id, 0) as payment_status_reason_id,
psrl.payment_status_reason_desc 
FROM payment p
  INNER JOIN payment_detail pd ON pd.payment_detail_id = p.most_recent_detail_id
  INNER JOIN payment_type_lu pt ON pt.payment_type_id = pd.payment_type_id
  INNER JOIN payment_method_lu pm ON pm.payment_method_id = pd.payment_method_id
  INNER JOIN payment_status_lu s ON s.payment_status_id = pd.payment_status_id
  INNER JOIN user u ON u.user_id = p.user_id
  LEFT OUTER JOIN payment_detail_status_reason_xref pdsrx ON pdsrx.payment_detail_id = pd.payment_detail_id
  LEFT OUTER JOIN payment_status_reason_lu psrl ON psrl.payment_status_reason_id= pdsrx.payment_status_reason_id
WHERE pdsrx.payment_status_reason_id = ${PAYMENT_STATUS_REASONS.V5_PAYMENT_CREATION}
  AND pd.payment_status_id = ${PAYMENT_STATUSES.ON_HOLD}`

const QUERY_GET_TAX_STATUS = `SELECT 1
FROM user_tax_form_xref utf
WHERE utf.user_id = %d
AND utf.status_id = ${TAX_FORM_STATUS.ACTIVE}`

const UPDATE_PAYMENT_STATUS = 'UPDATE payment_detail SET payment_status_id = ? WHERE payment_detail_id = ?'

// make sure id is not null - FIRST 1
const DELETE_PAYMENT_STATUS_REASON = 'DELETE from payment_detail_status_reason_xref WHERE payment_detail_id = ?'
const INSERT_PAYMENT_STATUS_REASON = 'INSERT INTO payment_detail_status_reason_xref (payment_detail_id, payment_status_reason_id) VALUES(?, ?)'

async function getUserIdsWithPaymentsAccruing () {
  const connection = await helper.getInformixConnection()
  try {
    logger.debug(`getUserIdsWithPaymentsAccruing - ${QUERY_GET_USERIDS_WITH_PAYMENT_STATUS_ACCRUING}`)
    return await connection.queryAsync(QUERY_GET_USERIDS_WITH_PAYMENT_STATUS_ACCRUING)
  } catch (e) {
    logger.error(`Error in 'getUserIdsWithPaymentsAccruing' ${e}`)
    throw e
  } finally {
    await connection.closeAsync()
  }
}

async function getUsersAccrualThreshold (userId) {
  const connection = await helper.getInformixConnection()
  try {
    const query = util.format(QUERY_GET_USERS_ACCRUING_THRESHOLD, userId)
    logger.debug(`getUsersAccrualAmount - ${query}`)
    const [r] = await connection.queryAsync(query)
    return r.accrual_amount
  } catch (e) {
    logger.error(`Error in 'getUsersAccrualThreshold' ${e}`)
    throw e
  } finally {
    await connection.closeAsync()
  }
}

async function getTotalUserPaymentsAccruing (userId) {
  const connection = await helper.getInformixConnection()
  try {
    const query = util.format(QUERY_GET_TOTAL_USER_ACCRUING_PAYMENTS, userId)
    logger.debug(`getTotalUserPaymentsAccruing - ${query}`)
    return await connection.queryAsync(query)
  } catch (e) {
    logger.error(`Error in 'getTotalUserPaymentsAccruing' ${e}`)
    throw e
  } finally {
    await connection.closeAsync()
  }
}

async function getV5PaymentsOnHold () {
  const connection = await helper.getInformixConnection()
  try {
    // await connection.beginTransactionAsync()

    logger.debug(`getV5PaymentsOnHold - ${QUERY_GET_PAYMENTS_ON_HOLD}`)
    return await connection.queryAsync(QUERY_GET_PAYMENTS_ON_HOLD)
    // await connection.commitTransactionAsync()
  } catch (e) {
    logger.error(`Error in 'getV5PaymentsOnHold' ${e}`)
    // await connection.rollbackTransactionAsync()
    throw e
  } finally {
    await connection.closeAsync()
  }
}

async function getTaxStatusForUserId (userId) {
  const connection = await helper.getInformixConnection()

  try {
    // await connection.beginTransactionAsync()
    const query = util.format(QUERY_GET_TAX_STATUS, userId)
    logger.debug(`getOpenPayments - ${query}`)
    return await connection.queryAsync(query)
    // await connection.commitTransactionAsync()
  } catch (e) {
    logger.error(`Error in 'getOpenPayments' ${e}`)
    // await connection.rollbackTransactionAsync()
    throw e
  } finally {
    await connection.closeAsync()
  }
}

async function getAccruingPaymentsForUser (userId) {
  const connection = await helper.getInformixConnection()
  try {
    const query = util.format(QUERY_GET_USER_PAYMENTS_ACCRUING, userId)
    logger.debug(`getAccruingPaymentsForUser - ${query}`)
    return connection.queryAsync(query)
  } catch (e) {
    logger.error(`Error in 'getAccruingPaymentsForUser' ${e}`)
    throw e
  } finally {
    await connection.closeAsync()
  }
}

async function releaseAccruingPayments (userId) {
  // get payments with status accruing for user
  const paymentDetailIds = await getAccruingPaymentsForUser(userId)
  for (let i = 0; i < paymentDetailIds.length; i++) {
    const paymentDetailId = paymentDetailIds[i].payment_detail_id
    logger.debug(`releaseAccruingPayments - Updating Payment Status to Owed for Payment Detail ID: ${paymentDetailId}`)
    await updatePaymentStatus(paymentDetailId, PAYMENT_STATUSES.OWED)
  }
}

async function updatePaymentStatus (paymentDetailId, statusId, statusReasonId) {
  // delete payment status reason
  if (!paymentDetailId || paymentDetailId <= 1) {
    throw new Error(`Invalid paymentDetailId ${paymentDetailId}`)
  }
  const connection = await helper.getInformixConnection()
  try {
    await connection.beginTransactionAsync()

    const deleteQuery = await prepare(connection, DELETE_PAYMENT_STATUS_REASON)
    await deleteQuery.executeAsync([paymentDetailId])

    // update payment status
    // const updateQuery = util.format(UPDATE_PAYMENT_STATUS, statusId, paymentDetailId)
    const updateQuery = await prepare(connection, UPDATE_PAYMENT_STATUS)
    await updateQuery.executeAsync([statusId, paymentDetailId])

    if (statusReasonId) {
      // INSERT_PAYMENT_STATUS_REASON
      const insertStatusReasonQuery = await prepare(connection, INSERT_PAYMENT_STATUS_REASON)
      await insertStatusReasonQuery.executeAsync([paymentDetailId, statusReasonId])
    }
    await connection.commitTransactionAsync()
    logger.info(`Payment Status Updated - Payment Detail ID: ${paymentDetailId} Status ID: ${statusId}  Status Reason ID: ${statusReasonId}`)
    return true
  } catch (e) {
    logger.error(`Error in 'updatePaymentStatus' ${e}, rolling back transaction`)
    await connection.rollbackTransactionAsync()
    throw e
  } finally {
    await connection.closeAsync()
  }
}

module.exports = {
  updatePaymentStatus,
  getV5PaymentsOnHold,
  getTaxStatusForUserId,
  getUserIdsWithPaymentsAccruing,
  getUsersAccrualThreshold,
  getTotalUserPaymentsAccruing,
  releaseAccruingPayments
}
