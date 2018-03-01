const Promise = require('bluebird')

const logging = require('../logging')

const utilityQueries = require('../../models/queries/utilities')

const dropSchemaSequence = ['Sales', 'Invoices', 'Products', 'Clients']

module.exports = () => {
  logging.warning('Working data tables will be removed in sequence')
  return Promise.each(dropSchemaSequence, schema => {
    return utilityQueries.dropSchema(schema)
  })
    .then(() => {
      logging.warning('Successfully completed table removal process')
      return Promise.resolve()
    })
    .catch(error => {
      logging.error('Failed to complete table removal process')
      return Promise.reject(error)
    })
}
