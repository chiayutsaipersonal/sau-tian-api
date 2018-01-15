const path = require('path')

const logging = require('../logging')

const models = [
  { reference: 'Clients', definition: 'clients.js' },
  { reference: 'Invoices', definition: 'invoices.js' },
  { reference: 'Products', definition: 'products.js' },
  { reference: 'Sales', definition: 'sales.js' },
  { reference: 'ConversionFactors', definition: 'conversionFactors.js' },
  { reference: 'CustomSalesData', definition: 'customSalesData.js' },
  { reference: 'WorkingSalesData', definition: 'workingSalesData.js' },
]

module.exports = db => {
  models.forEach(model => {
    let modelPath = path.join(path.resolve('./models/definitions'), model.definition)
    db[model.reference] = require(modelPath)(db.sequelize, db.Sequelize)
    logging.console(`${model.reference} model is registered`)
  })
  return Promise.resolve()
}
