const express = require('express')

const invoiceQueries = require('../models/queries/invoices')

const router = express.Router()

router
  // get live and matching custom sales data (within date range)
  // extract valid custom sales data
  // align the custom sales data within the date range with valid data
  .get('/',
    (req, res, next) => {
      let dateRange = [req.query.startDate, req.query.endDate]
      return invoiceQueries.getLiveData(...dateRange)
        .then(data => {
          req.resJson = { data }
          return Promise.resolve(data)
        })
        .then(data => invoiceQueries.extractWorkingData(data))
        .then(data => invoiceQueries.alignCustomSalesData(...dateRange, data))
        .then(() => {
          next()
          return Promise.resolve()
        })
        .catch(error => next(error))
    })
  // record custom sales data
  // read all custom sales data
  // backup to .json file
  // read the upserted record and return
  .post('/',
    (req, res, next) => {
      return invoiceQueries.extractReqBodyData(req.body)
        .then(data => {
          return invoiceQueries.recordUpsert(data)
            .then(() => invoiceQueries.getCustomSalesRecord(data.id))
        })
        .then(data => {
          req.resJson = { data }
          next()
          return Promise.resolve()
        })
        .catch(error => next(error))
    }
  )

module.exports = router
