const express = require('express')
const fs = require('fs-extra')
const uuidV4 = require('uuid/v4')

const db = require('../controllers/database')
const logging = require('../controllers/logging')

const router = express.Router()

router
  .get('/', (req, res, next) => {
    return db.sequelize
      .query(liveDataQuery(req.query.startDate, req.query.endDate))
      .spread((data, meta) => {
        req.resJson = { data }
        next()
        return Promise.resolve(data.map(entry => {
          return {
            invoiceId: entry.invoiceId,
            clientId: entry.clientId,
            salesId: entry.salesId,
            productId: entry.productId,
            conversionFactorId: entry.conversionFactorId,
            price: entry.price,
            id: entry.id,
            _preserved: entry._preserved,
            _clientId: entry._clientId,
            _price: entry._price,
            _quantity: entry._quantity,
            _employeeId: entry._employeeId,
          }
        }))
        // return fs
        //   .outputJson('./data/customSalesData.json', workingData)
        //   .catch(error => {
        //     logging.error(error, 'Custom sales data writeout failure')
        //     return Promise.reject(error)
        //   })
        //   .then(() => {
        //     req.resJson = { data }
        //     next()
        //     return Promise.resolve()
        //   })
      })
      .catch(error => next(error))
  })
  .post('/', (req, res, next) => {
    let workingData = {}
    workingData.invoiceId = req.body.invoiceId
    workingData.clientId = req.body.clientId
    workingData.salesId = req.body.salesId
    workingData.productId = req.body.productId
    workingData.conversionFactorId = req.body.conversionFactorId
    workingData.price = req.body.price
    workingData.id = req.body.customSalesDataId !== null
      ? req.body.customSalesDataId
      : uuidV4().toUpperCase()
    if (req.body._preserved !== null) workingData._preserved = req.body._preserved
    if (req.body._clientId !== null) workingData._clientId = req.body._clientId
    if (req.body._price !== null) workingData._price = req.body._price
    if (req.body._quantity !== null) workingData._quantity = req.body._quantity
    if (req.body._employeeId !== null) workingData._employeeId = req.body._employeeId
    return db.CustomSalesData
      .upsert(workingData)
      .then(() => db.CustomSalesData.findAll())
      .then(data => {
        return fs
          .outputJson('./data/customSalesData.json', data)
          .catch(error => {
            logging.error(error, 'Custom sales data writeout failure')
            return Promise.reject(error)
          })
      })
      .then(() => db.CustomSalesData.findById(workingData.id))
      .then(data => {
        req.resJson = {
          data,
          message: 'Custom sales data recorded',
        }
        next()
        return Promise.resolve()
      })
      .catch(error => next(error))
  }
  )

module.exports = router

function liveDataQuery (startDate, endDate) {
  return `
SELECT invoices.date,
  products.name AS productName,
  sales.price,
  sales.quantity,
  invoices.employeeId,
  products.unit,
  clients.name AS companyName,
  clients.areaId,
  products.conversionFactor,
  invoices.id AS invoiceId,
  clients.id AS clientId,
  sales.id AS salesId,
  products.id AS productId,
  products.conversionFactorId,
  products.sapId,
  customSalesData.id AS customSalesDataId,
  customSalesData._preserved,
  customSalesData._clientId,
  customSalesData._price,
  customSalesData._quantity,
  customSalesData._employeeId
FROM invoices
  INNER JOIN
  clients ON clients.id = invoices.clientId
  INNER JOIN
  sales ON sales.invoiceId = invoices.id
  INNER JOIN
  products ON products.id = sales.productId
  LEFT JOIN
  customSalesData ON (customSalesData.invoiceId = invoices.id) AND
                     (customSalesData.clientId = invoices.clientId) AND
                     (customSalesData.salesId = sales.id) AND
                     (customSalesData.productId = sales.productId) AND
                     (customSalesData.conversionFactorId = products.conversionFactorId) AND
                     (customSalesData.price = sales.price)
WHERE invoices.date BETWEEN '${startDate}' AND '${endDate}' AND
  products.conversionFactorId IS NOT NULL
ORDER BY products.id,
     date;`
}
