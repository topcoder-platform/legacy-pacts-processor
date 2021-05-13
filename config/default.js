module.exports = {
  PORT: process.env.PORT || 3001,
  API_VERSION: process.env.API_VERSION || 'v5',
  SYNC_INTERVAL: process.env.SYNC_INTERVAL ? Number(process.env.SYNC_INTERVAL) : 2, // minutes
  SYNC_ENABLED: process.env.SYNC_ENABLED ? process.env.SYNC_ENABLED === 'true' : false,

  AUTH_SECRET: process.env.AUTH_SECRET || 'mysecret',
  VALID_ISSUERS: process.env.VALID_ISSUERS || '["https://api.topcoder-dev.com", "https://api.topcoder.com", "https://topcoder-dev.auth0.com/"]',

  // used to get M2M token
  AUTH0_URL: process.env.AUTH0_URL,
  AUTH0_PROXY_SERVER_URL: process.env.AUTH0_PROXY_SERVER_URL,
  AUTH0_AUDIENCE: process.env.AUTH0_AUDIENCE || 'https://www.topcoder-dev.com',
  TOKEN_CACHE_TIME: process.env.TOKEN_CACHE_TIME || 90,
  AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
  AUTH0_CLIENT_SECRET: process.env.AUTH0_CLIENT_SECRET,

  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  API_BASE_URL: process.env.API_BASE_URL || 'https://api.topcoder-dev.com',

  INFORMIX: {
    server: process.env.INFORMIX_SERVER || 'informixoltp_tcp', // informix server
    database: process.env.INFORMIX_DATABASE || 'tcs_catalog', // informix database
    host: process.env.INFORMIX_HOST || 'localhost', // host
    protocol: process.env.INFORMIX_PROTOCOL || 'onsoctcp',
    port: process.env.INFORMIX_PORT || '2021', // port
    db_locale: process.env.INFORMIX_DB_LOCALE || 'en_US.57372',
    user: process.env.INFORMIX_USER || 'informix', // user
    password: process.env.INFORMIX_PASSWORD || '1nf0rm1x', // password
    maxsize: parseInt(process.env.MAXSIZE) || 0,
    minpool: parseInt(process.env.MINPOOL, 10) || 1,
    maxpool: parseInt(process.env.MAXPOOL, 10) || 60,
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
    V5_PAYMENT_CREATION: process.env.V5_PAYMENT_DETAIL_STATUS_ID || 500
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
