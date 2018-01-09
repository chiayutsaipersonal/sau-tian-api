const express = require('express')

const db = require('../controllers/database')

const invoiceQueries = require('../models/queries/invoices')

const router = express.Router()

router
  // get live and matching custom sales data (within date range)
  // extract valid custom sales data
  // query for custom sales data outside of date range)
  // back up custom sales data to .json file
  // (valid data within date range plus all data outside of the range)
  .get('/',
    (req, res, next) => {
      let dateRange = [req.query.startDate, req.query.endDate]
      return invoiceQueries
        .getLiveData(...dateRange)
        .then(liveData => {
          req.resJson = { data: liveData }
          return Promise.resolve(liveData)
        })
        .then(liveData => invoiceQueries.extractCustomDataFromLiveData(liveData))
        .then(validCustomData => {
          return invoiceQueries
            .getIrreleventCustomData(...dateRange)
            .then(irreleventCustomData => {
              let customSalesData = validCustomData.concat(irreleventCustomData)
              return Promise.resolve(customSalesData)
            })
        })
        .then(customSalesData => invoiceQueries.backupCustomInvoiceData(customSalesData))
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
      return invoiceQueries
        .prepCustomRecord(req.body)
        .then(customRecord => {
          return invoiceQueries
            .recordCustomData(customRecord)
            .then(() => invoiceQueries.getCustomSalesData())
            .then(customSalesData => invoiceQueries.backupCustomInvoiceData(customSalesData))
            .then(() => invoiceQueries.getCustomSalesRecord(customRecord.id))
        })
        .then(data => {
          req.resJson = {
            data,
            message: 'Custom sales data recorded',
          }
          next()
          return Promise.resolve()
        })
        .catch(error => next(error))
    }
  )

module.exports = router
