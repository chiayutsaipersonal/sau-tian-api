const Promise = require('bluebird')

const logging = require('../logging')

module.exports = (db, force = false) => {
  let models = db.workingDataConfig.models
  return Promise.each(models.references, modelRef => {
    let syncOperation = force
      ? db[modelRef].sync({ force: true })
      : db[modelRef].sync()
    return syncOperation
      .then(result => {
        logging.console(force
          ? `${modelRef} table synchronized (forced resync)`
          : `${modelRef} table synchronized`)
        return Promise.resolve()
      }).catch(error => Promise.reject(error))
  }).then(() => {
    return Promise.resolve()
  }).catch(error => {
    logging.error(error, 'Working DB model synchronization failure')
    return Promise.reject(error)
  })
}
