const path = require('path')

require('dotenv').config()
const eVars = process.env

const appConfig = require('./app')

const logging = require('../controllers/logging')

// settings
const ormVerbose = false

const sqlite = {
  dialect: 'sqlite',
  storage: path.resolve(`./data/${appConfig.reference}.db`),
  database: appConfig.reference,
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
  host: eVars.MYSQL_HOST,
  port: 3306,
  database: eVars.SYS_REF,
  username: eVars.MYSQL_ACCOUNT,
  password: eVars.MYSQL_PASS,
  logging: ormVerbose ? logging.warning : false,
  timezone: appConfig.timezone,
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

module.exports = eVars.NODE_ENV === 'staging' ? mysql : sqlite
