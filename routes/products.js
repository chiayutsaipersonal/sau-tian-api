const express = require('express')
const fs = require('fs-extra')
const multer = require('multer')

const db = require('../controllers/database')
const logging = require('../controllers/logging')

const pagination = require('../middlewares/pagination')

const router = express.Router()

router
  // search for conversionFactors record matching productId or conversionFactorId
  .get('/:productId/conversionFactors/:conversionFactorId',
    (req, res, next) => {
      return db.ConversionFactors.findAll({
        where: {
          [db.Sequelize.Op.or]: [
            { id: req.params.conversionFactorId },
            { productId: req.params.productId },
          ],
        },
      }).then(data => {
        req.resJson = { data }
        next()
        return Promise.resolve()
      }).catch(error => {
        return next(error)
      })
    }
  )
  // GET product listing
  .get('/',
    pagination(recordCount(db)),
    (req, res, next) => {
      const queryString = 'SELECT products.*, conversionFactors.id AS \'conversionFactorId\', conversionFactors.conversionFactor FROM products LEFT JOIN conversionFactors ON products.id = conversionFactors.productId ORDER BY conversionFactorId IS NULL, id'
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
  // update product record
  .post('/',
    multer().none(),
    (req, res, next) => {
      let deleteQuery = `DELETE FROM conversionFactors WHERE id = '${req.body.conversionFactorId}' OR productId = '${req.body.productId}';`
      return db.sequelize
        .transaction(transaction => {
          return db.sequelize
            .query(deleteQuery, {
              transaction,
              logging: logging.warning,
            })
            .then(() => {
              return Promise.resolve()
            })
            .catch(error => {
              logging.error(error, 'Delete query failure')
              return Promise.reject(error)
            })
        }).then(() => {
          return db.ConversionFactors
            .findAll()
            .catch(error => {
              logging.error(error, 'Conversion factor data reading failure')
              return Promise.reject(error)
            })
        }).then(records => {
          return fs
            .outputJson('./data/disConFactor.json', records)
            .catch(error => {
              logging.error(error, 'product conversion factor data writeout failure')
              return Promise.reject(error)
            })
        }).then(() => {
          req.resJson = { message: '轉換率資料更新成功' }
          next()
          return Promise.resolve()
        }).catch(error => {
          return next(error)
        })
    // return db.ConversionFactors
    //   .delete({ id: req.body.conversionFactorId })
    //   .then(() => {
    //     return db.ConversionFactors.delete({ productId: req.body.productId })
    //   }).then(() => {
    //     return db.ConversionFactors.upsert({
    //       id: req.body.conversionFactorId || null,
    //       productId: req.body.productId || null,
    //       conversionFactor: req.body.conversionFactor || null,
    //     })
    //   })
    }
  )

module.exports = router

function recordCount (db) {
  return () => {
    const queryString = 'SELECT products.*, conversionFactors.id AS \'conversionFactorId\', conversionFactors.conversionFactor FROM products LEFT JOIN conversionFactors ON products.id = conversionFactors.productId;'
    return db.sequelize
      .query(queryString)
      .spread((data, meta) => Promise.resolve(data.length))
      .catch(error => Promise.reject(error))
  }
}
