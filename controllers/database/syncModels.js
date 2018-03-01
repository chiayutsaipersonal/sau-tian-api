const Promise = require('bluebird')

const logging = require('../logging')

const utilityQueries = require('../../models/queries/utilities')

const models = [
  { reference: 'Clients', force: true },
  { reference: 'Invoices', force: true },
  { reference: 'Products', force: true },
  { reference: 'Sales', force: true },
  { reference: 'ConversionFactors', force: false },
  { reference: 'CustomSalesData', force: false },
]

module.exports = () => {
  return Promise.each(models, model => {
    return utilityQueries.syncModel(model.reference, model.force)
  })
    .then(() => {
      return Promise.resolve()
    })
    .catch(error => {
      logging.error(error, 'Working DB models synchronization failure')
      return Promise.reject(error)
    })
}
