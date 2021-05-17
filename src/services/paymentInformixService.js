// const _ = require('lodash')
const util = require('util')
const logger = require('../util/logger')
const {
  PAYMENT_STATUSES,
  PAYMENT_STATUS_REASONS,
  TAX_FORM_STATUS
} = require('config')
const { executeQueryAsync } = require('../util/informixWrapper')

const QUERY_GET_PAYMENTS = `SELECT 
p.payment_id, 
pd.payment_detail_id,
pd.payment_desc, 
pd.payment_type_id, 
pd.payment_method_id, 
p.create_date, 
pd.create_date as modify_date,
pt.payment_type_desc, 
pm.payment_method_desc, 
pd.net_amount, 
pd.payment_status_id, 
s.payment_status_desc,
p.user_id, 
u.handle, 
u.first_name, 
u.middle_name, 
u.last_name,
pd.date_modified, 
pd.date_paid, 
pd.gross_amount, 
nvl(pdsrx.payment_status_reason_id, 0) as payment_status_reason_id,
psrl.payment_status_reason_desc,
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
pd.jira_issue_id
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

const UPDATE_PAYMENT_STATUS = 'UPDATE payment_detail SET payment_status_id = %d'

// make sure id is not null - FIRST 1
const DELETE_PAYMENT_STATUS_REASON = 'DELETE from payment_detail_status_reason_xref WHERE payment_detail_id = %d'
const INSERT_PAYMENT_STATUS_REASON = 'INSERT INTO payment_detail_status_reason_xref (payment_detail_id, payment_detail_status_reason_id) VALUES(%d, %d)'

async function getOpenPayments () {
  logger.debug(`getOpenPayments - ${QUERY_GET_PAYMENTS}`)
  return execQuery(QUERY_GET_PAYMENTS)
}

async function getTaxStatusForUserId (userId) {
  // QUERY_GET_TAX_STATUS
  const query = util.format(QUERY_GET_TAX_STATUS, userId)
  logger.debug(`getTaxStatusForUserId - ${query}`)
  return execQuery(query)
}

async function updatePaymentStatus (paymentDetailId, statusId, statusReasonId) {
  // delete payment status reason
  if (!paymentDetailId || paymentDetailId <= 1) {
    throw new Error(`Invalid paymentDetailId ${paymentDetailId}`)
  }
  const deleteQuery = util.format(DELETE_PAYMENT_STATUS_REASON, paymentDetailId)
  try {
    // await execQuery(deleteQuery)
    logger.debug(`updatePaymentStatus: Executing Delete Query - ${deleteQuery}`)
  } catch (e) {
    throw new Error(`updatePaymentStatus deleteQuery Error - ${e} - Query: ${deleteQuery}`)
  }

  // update payment status
  const updateQuery = util.format(UPDATE_PAYMENT_STATUS, statusId)
  try {
    // await execQuery(updateQuery)
    logger.debug(`updatePaymentStatus: Executing Update Query - ${updateQuery}`)
  } catch (e) {
    throw new Error(`updatePaymentStatus updateQuery Error - ${e} - Query: ${updateQuery}`)
  }

  if (statusReasonId) {
    // INSERT_PAYMENT_STATUS_REASON
    const insertStatusReasonQuery = util.format(INSERT_PAYMENT_STATUS_REASON, paymentDetailId, statusReasonId)
    try {
      // await execQuery(insertStatusReasonQuery)
      logger.debug(`updatePaymentStatus: Executing Insert Query - ${insertStatusReasonQuery}`)
    } catch (e) {
      throw new Error(`updatePaymentStatus insertStatusReasonQuery Error - ${e} - Query: ${insertStatusReasonQuery}`)
    }
  }
  return true
}

/**
 * Execute query
 *
 * @param {Object} conn informix connection instance
 * @param {String} sql sql
 * @param {String} order addition sql for ordering
 */
async function execQuery (sql) {
  // logger.debug('execQuery start')
  const result = await executeQueryAsync('informixoltp', sql)
  // logger.debug('execQuery end')
  return result
}

module.exports = {
  updatePaymentStatus,
  getOpenPayments,
  getTaxStatusForUserId
}
