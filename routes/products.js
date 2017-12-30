const express = require('express')
const db = require('../controllers/database')

const pagination = require('../middlewares/pagination')

const router = express.Router()

/*
GET product listing

find products that has conversion factor value
*/

router.get('/',
  pagination(recordCount(db)),
  (req, res, next) => {
    const queryString = 'SELECT products.*, conversionFactors.id AS \'conversionFactorId\', conversionFactors.conversionFactor FROM products INNER JOIN conversionFactors ON products.id = conversionFactors.productId ORDER BY id'
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
  return () => {
    const queryString = 'SELECT products.*, conversionFactors.id AS \'conversionFactorId\', conversionFactors.conversionFactor FROM products INNER JOIN conversionFactors ON products.id = conversionFactors.productId ORDER BY id;'
    return db.sequelize
      .query(queryString)
      .spread((data, meta) => Promise.resolve(data.length))
      .catch(error => Promise.reject(error))
  }
}
