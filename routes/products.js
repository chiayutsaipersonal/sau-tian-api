const express = require('express')
const { check } = require('express-validator/check')
const { sanitize } = require('express-validator/filter')
const fs = require('fs-extra')
const multer = require('multer')

const db = require('../controllers/database')
const logging = require('../controllers/logging')

const productQueries = require('../models/queries/products')

const pagination = require('../middlewares/pagination')

const router = express.Router()

router
  // search for other products that carries the specified conversion factor id
  .get('/:productId/conversionFactors/:conversionFactorId',
    (req, res, next) => {
      return db.Products.findAll({
        where: {
          id: { [db.Sequelize.Op.ne]: req.params.productId },
          conversionFactorId: req.params.conversionFactorId,
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
    pagination(productQueries.tableRecordCount),
    (req, res, next) => {
      let queryOptions = {
        order: ['id'],
      }
      if (req.linkHeader) {
        queryOptions.limit = req.queryOptions.limit
        queryOptions.offset = req.queryOptions.offset
      }
      return db.Products
        .findAll(queryOptions)
        .then(data => {
          req.resJson = { data }
          next()
          return Promise.resolve()
        })
        .catch(error => {
          return next(error)
        })
    }
  )
  // clear conversion factor data from a specified product
  .delete('/:productId', (req, res, next) => {
    return db.Products
      .findById(req.params.productId)
      .then(product => {
        if (!product) {
          res.status(404)
          let error = new Error(`Product id: '${req.params.productId} is missing'`)
          return Promise.reject(error)
        } else {
          return product.update({
            conversionFactorId: null,
            conversionFactor: null,
          }).catch(error => Promise.reject(error))
        }
      }).then(() => {
        return db.Products
          .findAll({
            where: {
              conversionFactorId: {
                [db.Sequelize.Op.ne]: null,
              },
            },
          })
          .then(data => Promise.resolve(data.map(entry => {
            return {
              productId: entry.id,
              conversionFactorId: entry.conversionFactorId,
              conversionFactor: entry.conversionFactor,
            }
          })))
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
        req.resJson = { message: 'Conversion factor cleared...' }
        next()
        return Promise.resolve()
      }).catch(error => next(error))
  })
  // update product record
  .post('/',
    multer().none(),
    [
      check('productId').isEmpty(),
      check('conversionFactorId').isEmpty(),
      check('conversionFactor').isEmpty().isFloat(),
      sanitize('conversionFactor').toFloat(),
    ],
    (req, res, next) => {
      return db.sequelize.transaction(transaction => {
        return db.Products
          .update({
            conversionFactor: null,
            conversionFactorId: null,
          }, {
            where: {
              [db.Sequelize.Op.or]: [
                { id: req.body.productId },
                { conversionFactorId: req.body.conversionFactorId },
              ],
            },
            transaction,
          }).then(() => {
            return db.Products.update({
              conversionFactorId: req.body.conversionFactorId,
              conversionFactor: req.body.conversionFactor,
            }, {
              where: { id: req.body.productId },
              transaction,
            })
          }).then(() => {
            return Promise.resolve()
          }).catch(error => {
            logging.error(error)
            return Promise.reject(error)
          })
      }).then(() => {
        return db.Products
          .findAll({
            where: {
              conversionFactorId: {
                [db.Sequelize.Op.ne]: null,
              },
            },
          })
          .then(data => Promise.resolve(data.map(entry => {
            return {
              productId: entry.id,
              conversionFactorId: entry.conversionFactorId,
              conversionFactor: entry.conversionFactor,
            }
          })))
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
    }
  )

module.exports = router
