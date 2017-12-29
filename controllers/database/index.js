const Sequelize = require('sequelize')

const config = require('../../config/database')
const liveDataConfig = require('../../config/liveData')
const workingDataConfig = require('../../config/workingData')

const sequelize = new Sequelize(config.workingDb)

const verifyDatasource = require('./verifyDatasource')
const dropAllSchemas = require('./dropAllSchemas')
const generateModelList = require('./generateModelList')
const registerModels = require('./registerModels')
const syncModels = require('./syncModels')
const buildAssociations = require('./buildAssociations')
const extractLiveData = require('./extractLiveData')
const buildWorkingData = require('./buildWorkingData')

const db = {
  Sequelize,
  sequelize,
  config,
  liveDataConfig,
  workingDataConfig,
  ready: false,
  initialize,
  extractLiveData,
  hydrateWorkingData,
}

module.exports = db

function hydrateWorkingData () {
  return extractLiveData(db)
    .then(liveData => buildWorkingData(db, liveData))
    .then(() => Promise.resolve(`${config.workingDb.dialect} working database hydrated with live data...`))
    .catch(error => Promise.reject(error))
}

function initialize (force = false) {
  return sequelize
    .authenticate()
    .then(() => verifyDatasource(db))
    .then(() => dropAllSchemas(db, force))
    .then(() => generateModelList(db))
    .then(() => registerModels(db))
    .then(() => syncModels(db, true))
    .then(() => buildAssociations(db))
    .then(() => syncModels(db, true))
    .then(() => {
      db.ready = false
      return Promise.resolve()
    })
    .then(() => {
      return Promise.resolve()
    })
    .then(() => Promise.resolve(`${config.workingDb.dialect} database structure initialized...`))
    .catch(error => Promise.reject(error))
}
