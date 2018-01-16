const express = require('express')

const productQueries = require('../models/queries/products')

const pagination = require('../middlewares/pagination')

const router = express.Router()

router
  // find a list of products that carries the same convFactorId
  .get('/:productId/conversionFactors/:conversionFactorId',
    (req, res, next) => {
      return productQueries
        .findDuplicates(
          req.params.productId,
          req.params.conversionFactorId,
        ).then(data => {
          req.resJson = { data }
          next()
          return Promise.resolve()
        }).catch(error => next(error))
    }
  )
  // get product listing (optional pagination)
  .get('/',
    pagination(productQueries.recordCount),
    (req, res, next) => {
      let query = req.linkHeader
        ? productQueries.getProducts(req.queryOptions.limit, req.queryOptions.offset)
        : productQueries.getProducts()
      return query.then(data => {
        req.resJson = { data }
        next()
        return Promise.resolve()
      }).catch(error => next(error))
    }
  )
  // clear conversion factor data from a specified product
  .delete('/:productId',
    (req, res, next) => {
      return productQueries
        .removeConvFactorInfo(req.params.productId)
        .then(() => {
          return productQueries.backupConvFactorData()
        }).then(() => {
          req.resJson = { message: 'Conversion factor cleared...' }
          next()
          return Promise.resolve()
        }).catch(error => next(error))
    })
  // update conversion factor data
  .post('/',
    (req, res, next) => {
      return productQueries
        .insertConversionFactor(req.body)
        .then(() => productQueries.backupConvFactorData())
        .then(() => {
          req.resJson = { message: 'Conversion factor information updated' }
          next()
          return Promise.resolve()
        })
        .catch(error => {
          if (error.status) res.status(error.status)
          return next(error)
        })
    }
  )

module.exports = router
