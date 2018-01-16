const Sequelize = require('sequelize')

const dbConfig = require('../../config/database')

const sequelize = new Sequelize(dbConfig)

const db = {
  Sequelize,
  sequelize,
  ready: false,
  initialize,
  hydrateWorkingData,
}

module.exports = db

const verifyLiveDataSource = require('./verifyLiveDataSource')
const dropSchemas = require('./dropSchemas')
const registerModels = require('./registerModels')
const syncModels = require('./syncModels')
const buildAssociations = require('./buildAssociations')
const extractLiveData = require('./extractLiveData')
const buildWorkingData = require('./buildWorkingData')

function hydrateWorkingData () {
  return extractLiveData()
    .then(liveData => buildWorkingData(db, liveData))
    .then(() => Promise.resolve(`${dbConfig.dialect} working database hydrated with live data...`))
    .catch(error => Promise.reject(error))
}

function initialize () {
  return sequelize
    .authenticate()
    .then(() => verifyLiveDataSource())
    .then(() => dropSchemas())
    .then(() => registerModels(db))
    .then(() => syncModels())
    .then(() => buildAssociations(db))
    .then(() => syncModels())
    .then(() => {
      db.ready = false
      return Promise.resolve()
    })
    .then(() => {
      return Promise.resolve()
    })
    .then(() => Promise.resolve(`${dbConfig.dialect} database structure initialized...`))
    .catch(error => Promise.reject(error))
}
