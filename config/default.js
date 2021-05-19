module.exports = {
  PORT: process.env.PORT || 3001,
  PROCESS_ON_HOLD_ENABLED: process.env.PROCESS_ON_HOLD_ENABLED ? process.env.PROCESS_ON_HOLD_ENABLED === 'true' : false,
  PROCESS_ON_HOLD_INTERVAL: process.env.PROCESS_ON_HOLD_INTERVAL ? Number(process.env.PROCESS_ON_HOLD_INTERVAL) : 2, // minutes

  PROCESS_ACCRUING_ENABLED: process.env.PROCESS_ACCRUING_ENABLED ? process.env.PROCESS_ACCRUING_ENABLED === 'true' : false,
  PROCESS_ACCRUING_INTERVAL: process.env.PROCESS_ACCRUING_INTERVAL ? Number(process.env.PROCESS_ACCRUING_INTERVAL) : 2, // minutes

  LOG_LEVEL: process.env.LOG_LEVEL || 'info',

  INFORMIX: {
    SERVER: process.env.INFORMIX_SERVER || 'informixoltp_tcp', // informix server
    DATABASE: process.env.INFORMIX_DATABASE || 'informixoltp', // informix database
    HOST: process.env.INFORMIX_HOST || 'localhost', // host
    PROTOCOL: process.env.INFORMIX_PROTOCOL || 'onsoctcp',
    PORT: process.env.INFORMIX_PORT || '2021', // port
    DB_LOCALE: process.env.INFORMIX_DB_LOCALE || 'en_US.57372',
    USER: process.env.INFORMIX_USER || 'informix', // user
    PASSWORD: process.env.INFORMIX_PASSWORD || '1nf0rm1x', // password
    POOL_MAX_SIZE: parseInt(process.env.MAXPOOL, 10) || 60,
    maxsize: parseInt(process.env.MAXSIZE) || 0,
    minpool: parseInt(process.env.MINPOOL, 10) || 1,
    idleTimeout: parseInt(process.env.IDLETIMEOUT, 10) || 3600,
    timeout: parseInt(process.env.TIMEOUT, 10) || 30000
  },

  PAYMENT_STATUSES: {
    PAID: 53,
    ON_HOLD: 55,
    OWED: 56,

    CANCELLED: 65,
    EXPIRED: 68,
    DELETED: 69,
    ENTERED: 70,

    ACCRUING: 71
  },

  PAYMENT_STATUS_REASONS: {
    WAITING_FOR_TAX_FORM: 10,
    V5_PAYMENT_CREATION: process.env.V5_PAYMENT_CREATION || 500
  },
  TAX_FORM_STATUS: {
    ACTIVE: 60
  }
  // AMAZON: {
  //   // Uncomment for local deployment
  //   // AWS_ACCESS_KEY_ID: process.env.AWS_FAKE_ID || 'FAKE_ACCESS_KEY',
  //   // AWS_SECRET_ACCESS_KEY: process.env.AWS_FAKE_KEY || 'FAKE_SECRET_ACCESS_KEY',
  //   AWS_REGION: process.env.AWS_REGION || 'ap-northeast-1', // aws region
  //   IS_LOCAL_DB: process.env.IS_LOCAL_DB ? process.env.IS_LOCAL_DB === 'true' : false, // true or uninitialize if we use local instance
  //   DYNAMODB_URL: process.env.DYNAMODB_URL || 'http://localhost:8000', // just for local development
  //   S3_API_VERSION: process.env.S3_API_VERSION || '2006-03-01'
  // },
}
