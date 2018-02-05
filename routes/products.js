const convertExcel = require('convert-excel-to-json')
const express = require('express')
const fs = require('fs-extra')
const path = require('path')
const multer = require('multer')({
  dest: path.resolve('./data'),
  fileFilter: (req, file, cb) => {
    if (!file.originalname.toLowerCase().match(/\.(xls|xlsx)$/)) {
      return cb(new Error('Only excel files are allowed!'), false)
    }
    return cb(null, true)
  },
  limits: { fileSize: 500000 },
})

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
          req.resJson = { message: 'Conversion factor cleared...' }
          next()
          return Promise.resolve()
        })
        .catch(error => next(error))
    })
  // update conversion factor data
  .post('/',
    (req, res, next) => {
      return productQueries
        .insertConversionFactor(req.body)
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
  // receive and process an excel file of conversion factor data
  // all prior conversion factor data are saved to .json and wiped from database
  .post('/upload',
    multer.single('conversionFactors'),
    (req, res, next) => {
      let convertedData = JSON.stringify(convertExcel({
        sourceFile: req.file.path,
        header: { rows: 1 },
        columnToKey: {
          A: 'id',
          B: 'productId',
          C: 'conversionFactor',
        },
        sheets: ['conversionFactors'],
      }).conversionFactors)
      return productQueries
        .backupConvFactorData()
        .then(() => productQueries.resetConversionFactors())
        .then(() => productQueries.batchSequentialInsert(convertedData))
        .then(() => fs.remove(req.file.path))
        .then(() => {
          req.resJson = { message: 'Conversion factor information uploaded' }
          next()
          return Promise.resolve()
        })
        .catch(error => next(error))
    })
  // receive and process an excel file of custom stock quantity data
  // all prior stock quantity data are saved to .json and wiped from database
  .post('/uploadStock',
    multer.single('customStockQuantities'),
    (req, res, next) => {
      let convertedData = JSON.stringify(convertExcel({
        sourceFile: req.file.path,
        header: { rows: 1 },
        columnToKey: {
          A: 'id',
          B: 'productId',
          C: 'customStockQty',
        },
        sheets: ['customStockQuantities'],
      }).customStockQuantities)
      return productQueries.batchSequentialUpdate(convertedData)
        .then(() => fs.remove(req.file.path))
        .then(() => {
          req.resJson = { message: 'Custom stock quantity information uploaded' }
          next()
          return Promise.resolve()
        })
        .catch(error => next(error))
    })

module.exports = router
