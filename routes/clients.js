const express = require('express')
const db = require('../controllers/database')

const pagination = require('../middlewares/pagination')

const router = express.Router()

/*
GET client listing

find invoices with sales entry with products that has conversion factor value, then find a distinct list of the clients ordered by client id that these invoices belongs to, then filter the clients whose area id is between 1 and 4
*/

router.get('/',
  pagination(recordCount(db)),
  (req, res, next) => {
    const queryString = 'SELECT DISTINCT clients.* FROM invoices INNER JOIN sales ON invoices.id = sales.invoiceId LEFT JOIN products ON products.id = sales.productId INNER JOIN conversionFactors ON conversionFactors.productId = products.id LEFT JOIN clients ON clients.id = invoices.clientId WHERE clients.areaId BETWEEN 1 AND 4 ORDER BY clients.id'
    let paginationString = req.linkHeader
      ? ` LIMIT ${req.queryOptions.limit} OFFSET ${req.queryOptions.offset};`
      : ';'
    return db.sequelize
      .query(queryString + paginationString)
      .spread((data, meta) => {
        req.resJson = { data }
        next()
        return Promise.resolve()
      })
      .catch(error => {
        return next(error)
      })
  }
)

module.exports = router

function recordCount (db) {
  const queryString = 'SELECT DISTINCT clients.* FROM invoices INNER JOIN sales ON invoices.id = sales.invoiceId LEFT JOIN products ON products.id = sales.productId INNER JOIN conversionFactors ON conversionFactors.productId = products.id LEFT JOIN clients ON clients.id = invoices.clientId WHERE clients.areaId BETWEEN 1 AND 4 ORDER BY clients.id;'
  return () => {
    return db.sequelize
      .query(queryString)
      .spread((data, meta) => Promise.resolve(data.length))
      .catch(error => Promise.reject(error))
  }
}
