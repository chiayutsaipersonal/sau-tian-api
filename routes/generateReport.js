
const express = require('express')
const fs = require('fs-extra')
const Promise = require('bluebird')

// const logging = require('../controllers/logging')

const clientQueries = require('../models/queries/clients')
const productQueries = require('../models/queries/products')
const invoiceQueries = require('../models/queries/invoices')

const router = express.Router()

const sequences = [
  ['distributorId', 'id', 'name', 'registrationId', 'contact', 'zipCode', 'address', 'telephone', 'fax', 'type'],
  ['distributorId', 'id', 'name', 'length', 'width', 'conversionFactor', 'unit', 'unitPrice', 'conversionFactorId', 'asp', 'stockQty'],
  ['distributorId', 'clientId', 'productId', 'date', 'currency', 'invoiceValue', 'quantity', 'employeeId'],
]

let reportNames = [
  './data/2702_cust.txt',
  './data/2702_sku.txt',
  './data/2702_sale.txt',
]

router
  // generate text report files
  .get('/',
    (req, res, next) => {
      let dateRange = [req.query.startDate, req.query.endDate]
      let reportQueries = [
        clientQueries.getClientReport(),
        productQueries.getProductReport(),
        invoiceQueries.getInvoiceReport(...dateRange),
      ]
      return Promise
        .each(reportQueries, (dataset, index) => {
          let reportCvsData = generateTextData(dataset, sequences[index])
          return fs.outputFile(reportNames[index], reportCvsData)
        }).then(() => {
          req.resJson = { message: 'done' }
          next()
          return Promise.resolve()
        }).catch(error => next(error))
    })

module.exports = router

function generateTextData (data, sequence) {
  let textData = ''
  data.forEach(entry => {
    sequence.forEach((fieldName, index) => {
      if (index === (sequence.length - 1)) {
        textData += (entry[fieldName] || '') + '\n'
      } else {
        textData += (entry[fieldName] || '') + ','
      }
    })
  })
  return textData
}
