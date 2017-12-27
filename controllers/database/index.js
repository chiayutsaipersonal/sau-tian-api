const Sequelize = require('sequelize')

const config = require('../../config/database')

const sequelize = new Sequelize(config.workingDb)

const dropAllSchemas = require('./dropAllSchemas')
const verifyDatasource = require('./verifyDatasource')
const generateModelList = require('./generateModelList')
const registerModels = require('./registerModels')
const syncModels = require('./syncModels')
const buildAssociations = require('./buildAssociations')

const status = {}

const db = {
  Sequelize,
  sequelize,
  config,
  status,
  initialize,
}

module.exports = db

function initialize (force = false) {
  return sequelize
    .authenticate()
    .then(() => verifyDatasource())
    .then(() => dropAllSchemas(db, force))
    .then(() => generateModelList(db))
    .then(() => registerModels(db))
    .then(() => syncModels(db, true))
    .then(() => buildAssociations(db))
    .then(() => syncModels(db, true))
    .then(() => {
      return Promise.resolve()
    })
    .then(() => Promise.resolve(`${config.workingDb.dialect} database initialized...`))
    .catch(error => Promise.reject(error))
}
