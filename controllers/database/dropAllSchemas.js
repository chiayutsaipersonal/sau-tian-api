const Promise = require('bluebird')

const logging = require('../logging')

module.exports = (db, force = false) => {
  if (force) {
    logging.warning('All working data tables will be removed in sequence')
    return Promise
      .each(db.config.dropSchemaSequence, targetTableName => {
        return db.sequelize
          .dropSchema(targetTableName)
          .then(() => {
            logging.console(`${targetTableName} data table is removed...`)
            return Promise.resolve()
          })
          .catch(error => {
            logging.error(error, `Failed to remove ${targetTableName} data table ...`)
            return Promise.reject(error)
          })
      })
      .then(() => {
        logging.warning('Successfully completed table removal process')
        return Promise.resolve()
      })
      .catch(error => {
        logging.error('Failed to complete table removal process')
        return Promise.reject(error)
      })
  } else {
    return Promise.resolve()
  }
}
