const express = require('express')
const db = require('../controllers/database')

const router = express.Router()

router.get('/',
  (req, res, next) => {
    return db.sequelize
      .query(getQueryString(
        req.query.startDate || null,
        req.query.endDate || null,
        req.query.productId || null
      ))
      .spread((data, meta) => {
        req.resJson = { data }
        next()
        return Promise.resolve()
      })
      .catch(error => next(error))
  }
)

module.exports = router

function getQueryString (startDate, endDate, productId) {
  return `
SELECT
  sales.id AS 'salesId'
  ,sales.quantity
  ,sales.price
  ,sales.invoiceId
  ,invoices.date
  ,invoices.employeeId
  ,sales.productId
  ,products.sapId
  ,products.name AS 'productName'
  ,products.stockQty
  ,products.unit
  ,products.length
  ,products.width
  ,products.asp
  ,conversionFactors.id AS 'conversionFactorId'
  ,conversionFactors.conversionFactor
  ,invoices.clientId
  ,clients.name AS 'clientName'
  ,clients.registrationId
  ,clients.contact
  ,clients.zipCode
  ,clients.areaId
  ,clients.address
  ,clients.telephone
  ,clients.fax
  ,clients.type
FROM sales
  INNER JOIN products ON sales.productId = products.id
  INNER JOIN conversionFactors ON sales.productId = conversionFactors.productId
  INNER JOIN invoices ON sales.invoiceId = invoices.id
  INNER JOIN clients ON invoices.clientId = clients.id
WHERE invoices.date BETWEEN '${startDate}' AND '${endDate}'${productId ? ` AND sales.productId = '${productId}'` : ''}
ORDER BY products.id, clients.id, invoices.date;`
}
