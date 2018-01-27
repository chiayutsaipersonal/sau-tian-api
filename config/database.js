const path = require('path')

const appConfig = require('./app')

const logging = require('../controllers/logging')

// settings
const ormVerbose = false

module.exports = {
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
