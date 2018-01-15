const db = require('../../controllers/database')
const logging = require('../../controllers/logging')

module.exports = {
  dropSchema,
  syncModel,
}

function dropSchema (schema) {
  return db.sequelize
    .dropSchema(schema)
    .then(() => {
      logging.console(`${schema} data table is removed`)
      return Promise.resolve()
    })
    .catch(error => {
      logging.error(error, `${schema} data table removal failure`)
      return Promise.reject(error)
    })
}

function syncModel (model, force = false) {
  let syncOp = force
    ? db[model].sync({ force })
    : db[model].sync()
  return syncOp
    .then(result => {
      logging.console(force
        ? `${model} table synchronized (refreshed)`
        : `${model} table synchronized`)
      return Promise.resolve()
    })
    .catch(error => {
      logging.error(error, `${model} table synchronization failure`)
      return Promise.reject(error)
    })
}
