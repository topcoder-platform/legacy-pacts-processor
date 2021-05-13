/**
 * helper methods
 */
const _ = require('lodash')
const moment = require('moment-timezone')

/**
 * Wrap async function to standard express function
 * @param {Function} fn the async function
 * @returns {Function} the wrapped function
 */
function wrapExpress (fn) {
  return function (req, res, next) {
    fn(req, res, next).catch(next)
  }
}

/**
 * Wrap all functions from object
 * @param obj the object (controller exports)
 * @returns {Object|Array} the wrapped object
 */
function autoWrapExpress (obj) {
  if (_.isArray(obj)) {
    return obj.map(autoWrapExpress)
  }
  if (_.isFunction(obj)) {
    if (obj.constructor.name === 'AsyncFunction') {
      return wrapExpress(obj)
    }
    return obj
  }
  _.each(obj, (value, key) => {
    obj[key] = autoWrapExpress(value)
  })
  return obj
}

/**
 * Generate informx-flavor date from date string.
 * Also, changes the timezone to EST
 *
 * @param {String} date the date to be converted
 * @returns {String} informx-flavor date
 */
function generateInformxDate (date) {
  return moment(date).tz('America/New_York').format('YYYY-MM-DD HH:mm:ss.SSS')
}

module.exports = {
  wrapExpress,
  autoWrapExpress,
  generateInformxDate
}
