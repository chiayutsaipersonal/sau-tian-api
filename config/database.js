const path = require('path')

require('dotenv').config()
const eVars = process.env
const config = {
  app: require('../config/app'),
}

const logging = require('../controllers/logging')

const ormVerbose = false

const sqlite = {
  dialect: 'sqlite',
  storage: path.resolve('./data/sauTian.db'),
  database: config.app.reference,
  logging: ormVerbose ? logging.warning : false,
  define: {
    underscored: false,
    freezeTableName: true,
    timestamps: false,
    paranoid: false,
    createdAt: null, // 'createdAt',
    updatedAt: null, // 'updatedAt',
    deletedAt: null, // 'deletedAt'
  },
  operatorsAliases: false,
}

const mysql = {
  dialect: 'mysql',
  host: 'asjgroup.ctqis38kfqvo.ap-northeast-1.rds.amazonaws.com',
  port: 3306,
  database: eVars.SYS_REF,
  username: eVars.MYSQL_ACCOUNT,
  password: eVars.MYSQL_PASS,
  logging: ormVerbose ? logging.warning : false,
  timezone: config.app.hosting.timezone,
  pool: {
    max: 5, // default: 5
    min: 0, // default: 0
    idle: 60000, // default: 10000
    acquire: 10000, // default: 10000
    evict: 10000, // default: 10000
    retry: { max: 3 },
  },
  define: {
    underscored: false,
    freezeTableName: true,
    timestamps: false,
    paranoid: false,
    createdAt: null, // 'createdAt',
    updatedAt: null, // 'updatedAt',
    deletedAt: null, // 'deletedAt'
  },
  operatorsAliases: false,
}

const dropSchemaSequence = []

module.exports = {
  workingCopy: {
    development: sqlite,
    staging: mysql,
    production: sqlite,
  },
  liveData: {
    path: eVars.LIVE_DATABASE_FILE_PATH,
    tables: [
      { modelName: 'Clients', tableName: 'customer.DBF' },
      { modelName: 'Products', tableName: 'item.DBF' },
      { modelName: 'Invoices', tableName: 'sal.DBF' },
      { modelName: 'Sales', tableName: 'saldet.DBF' },
    ],
    disConFactorFile: path.resolve('./data/disConFactor.json'),
  },
  dropSchemaSequence,
}

/*
# client information
COMP_UCODE=42777910
DIS_NO=400005
*/
