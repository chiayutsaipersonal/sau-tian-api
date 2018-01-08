const express = require('express')

const productQueries = require('../models/queries/products')

const pagination = require('../middlewares/pagination')

const router = express.Router()

router
  // find a list of products that carries the same convFactorId
  .get('/:productId/conversionFactors/:conversionFactorId',
    (req, res, next) => {
      let a = req.params.productId
      let b = req.params.conversionFactorId
      return productQueries
        .findDuplicates(a, b)
        .then(data => {
          req.resJson = { data }
          next()
          return Promise.resolve()
        })
        .catch(error => next(error))
    }
  )
  // get product listing (optional pagination)
  .get('/',
    pagination(productQueries.recordCount),
    (req, res, next) => {
      let query = req.linkHeader
        ? productQueries.getProducts(req.queryOptions.limit, req.queryOptions.offset)
        : productQueries.getProducts()
      return query
        .then(data => {
          req.resJson = { data }
          next()
          return Promise.resolve()
        })
        .catch(error => next(error))
    }
  )
  // clear conversion factor data from a specified product
  // backup all convFactor data into a .json file
  .delete('/:productId',
    (req, res, next) => {
      return productQueries
        .getProduct(req.params.productId)
        .catch(error => {
          if (error.status) res.status(error.status)
          return Promise.reject(error)
        }).then(productInstance => {
          return productQueries.removeConvFactorInfo(productInstance)
        }).then(() => {
          return productQueries.extractConvFactorData()
        }).then(convFactorData => {
          return productQueries.backupConvFactorData(convFactorData)
        }).then(() => {
          req.resJson = { message: 'Conversion factor cleared...' }
          next()
          return Promise.resolve()
        }).catch(error => next(error))
    })
  // update conversion factor data
  // backup all convFactor data into a .json file
  .post('/',
    (req, res, next) => {
      let productId = req.body.productId
      let conversionFactorId = req.body.conversionFactorId
      let conversionFactor = req.body.conversionFactor
      return productQueries
        .addConvFactorInfo(
          productId,
          conversionFactorId,
          conversionFactor
        ).then(() => {
          return productQueries.extractConvFactorData()
        }).then(convFactorData => {
          return productQueries.backupConvFactorData(convFactorData)
        }).then(() => {
          req.resJson = { message: 'Conversion factor information updated' }
          next()
          return Promise.resolve()
        }).catch(error => {
          return next(error)
        })
    }
  )

module.exports = router
