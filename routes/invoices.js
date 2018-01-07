const express = require('express')
const db = require('../controllers/database')

// const pagination = require('../middlewares/pagination')

const router = express.Router()

router
  .get(
    '/',
    (req, res, next) => {
      return db.sequelize
        .query(liveDataQuery(req.query.startDate, req.query.endDate))
        .spread((data, meta) => {
          req.resJson = { data }
          next()
          return Promise.resolve()
        })
        .catch(error => next(error))
    })
// .get('/', (req, res, next) => {
//   return db.sequelize
//     .query(getQueryString(
//       req.query.startDate || null,
//       req.query.endDate || null,
//       req.query.productId || null,
//     ))
//     .spread((data, meta) => {
//       req.resJson = { data }
//       next()
//       return Promise.resolve()
//     })
//     .catch(error => next(error))
// })
// .get('/products/ids', (req, res, next) => {
//   return db.sequelize
//     .query(getPossibleIdsQueryString(
//       req.query.startDate || null,
//       req.query.endDate || null,
//     ))
//     .spread((data, meta) => Promise.resolve(data))
//     .map(data => data.productId)
//     .then(data => {
//       req.resJson = { data }
//       next()
//       return Promise.resolve()
//     })
//     .catch(error => next(error))
// })

module.exports = router

// function getQueryString (startDate, endDate, productId) {
//   return `
// SELECT
//   sales.id AS 'salesId'
//   ,sales.quantity
//   ,sales.price
//   ,sales.invoiceId
//   ,invoices.date
//   ,invoices.employeeId
//   ,sales.productId
//   ,products.sapId
//   ,products.name AS 'productName'
//   ,products.stockQty
//   ,products.unit
//   ,products.length
//   ,products.width
//   ,products.asp
//   ,conversionFactors.id AS 'conversionFactorId'
//   ,conversionFactors.conversionFactor
//   ,invoices.clientId
//   ,clients.name AS 'clientName'
//   ,clients.registrationId
//   ,clients.contact
//   ,clients.zipCode
//   ,clients.areaId
//   ,clients.address
//   ,clients.telephone
//   ,clients.fax
//   ,clients.type
// FROM sales
//   INNER JOIN products ON sales.productId = products.id
//   INNER JOIN conversionFactors ON sales.productId = conversionFactors.productId
//   INNER JOIN invoices ON sales.invoiceId = invoices.id
//   INNER JOIN clients ON invoices.clientId = clients.id
// WHERE invoices.date BETWEEN '${startDate}' AND '${endDate}'${productId ? ` AND sales.productId = '${productId}'` : ''}
// ORDER BY products.id, clients.id, invoices.date;`
// }

// function getPossibleIdsQueryString (startDate, endDate) {
//   return `
// SELECT DISTINCT
//   sales.productId
// FROM sales
//   INNER JOIN products ON sales.productId = products.id
//   INNER JOIN conversionFactors ON sales.productId = conversionFactors.productId
//   INNER JOIN invoices ON sales.invoiceId = invoices.id
//   INNER JOIN clients ON invoices.clientId = clients.id
// WHERE invoices.date BETWEEN '${startDate}' AND '${endDate}'
// ORDER BY products.id;`
// }

// function recordCount (db) {
//   const queryString = 'SELECT * FROM invoices INNER JOIN sales ON invoices.id = sales.invoiceId;'
//   return () => {
//     return db.sequelize
//       .query(queryString)
//       .spread((data, meta) => Promise.resolve(data.length))
//       .catch(error => Promise.reject(error))
//   }
// }

function liveDataQuery (startDate, endDate) {
  return `
SELECT
  invoices.date
  ,products.name AS 'productName'
  ,sales.price
  ,sales.quantity
  ,invoices.employeeId
  ,products.unit
  ,clients.name AS 'companyName'
  -- ,clients.contact
  ,clients.areaId
  ,products.conversionFactor
  ,invoices.id AS 'invoiceId'
  ,clients.id AS 'clientId'
  ,sales.id AS 'salesId'
  ,products.id AS 'productId'
  ,products.conversionFactorId
FROM
  invoices
      INNER JOIN
  clients ON clients.id = invoices.clientId
      INNER JOIN
  sales ON sales.invoiceId = invoices.id
      INNER JOIN
  products ON products.id = sales.productId
WHERE
  invoices.date BETWEEN '${startDate}' AND '${endDate}'
      AND
  products.conversionFactorId IS NOT NULL
ORDER BY products.id, date;`
}
