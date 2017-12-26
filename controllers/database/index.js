const Sequelize = require('sequelize')

const dbConfig = require('../../config/database').workingCopy[process.env.NODE_ENV || 'development']

const sequelize = new Sequelize(dbConfig)

const verifyDatasource = require('./verifyDatasource')
const syncModels = require('./syncModels')

const status = {}

const db = {
  Sequelize,
  sequelize,
  dbConfig,
  status,
  initialize,
}

module.exports = db

function initialize () {
  return sequelize
    .authenticate()
    .then(() => verifyDatasource())
    .then(() => syncModels(db, true))
    .then(() => Promise.resolve(`${dbConfig.dialect} database initialized...`))
    .catch(error => Promise.reject(error))
}
