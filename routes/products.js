const express = require('express')
const db = require('../controllers/database')

const pagination = require('../middlewares/pagination')
const responseHandler = require('../middlewares/responseHandlers')

const router = express.Router()

/*
GET product listing

find invoices with sales entry with products that has conversion factor value, then find a distinct list of the clients ordered by client id that these invoices belongs to, then filter the clients whose area id is between 1 and 4
*/

router.get('/',
  pagination(recordCount(db)),
  (req, res, next) => {
    let queryString = 'SELECT products.*, conversionFactors.id AS \'conversionFactorId\', conversionFactors.conversionFactor FROM products INNER JOIN conversionFactors ON products.id = conversionFactors.productId ORDER BY id'
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
  },
  responseHandler.json,
  responseHandler.error
)

module.exports = router

function recordCount (db) {
  return () => {
    return db.sequelize
      .query('SELECT products.*, conversionFactors.id AS \'conversionFactorId\', conversionFactors.conversionFactor FROM products INNER JOIN conversionFactors ON products.id = conversionFactors.productId ORDER BY id;')
      .spread((data, meta) => Promise.resolve(data.length))
      .catch(error => Promise.reject(error))
  }
}
