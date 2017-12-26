const Sequelize = require('sequelize')

const databaseConfig = require('../../config/database')

const sequelize = Sequelize(databaseConfig.workingCopy)

const status = {}

sequelize
  .authenticate()
  .then(() => Promise.resolve())
  .catch(error => { throw error })
