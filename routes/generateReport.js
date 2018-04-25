const archiver = require('archiver')
const encoding = require('encoding')
const express = require('express')
const Promise = require('bluebird')

const logging = require('../controllers/logging')

const clientQueries = require('../models/queries/clients')
const productQueries = require('../models/queries/products')
const invoiceQueries = require('../models/queries/invoices')

const router = express.Router()

const sequences = [
  [
    'distributorId',
    'id',
    'name',
    'registrationId',
    'contact',
    'zipCode',
    'address',
    'telephone',
    'fax',
    'type',
  ],
  [
    'distributorId',
    'id',
    'name',
    'length',
    'width',
    'conversionFactor',
    'unit',
    'unitPrice',
    'conversionFactorId',
    'asp',
    'stockQty',
  ],
  [
    'distributorId',
    'clientId',
    'productId',
    'date',
    'currency',
    'invoiceValue',
    'quantity',
    'employeeId',
  ],
]

// streaming version
const reportNames = ['2702_cust.txt', '2702_sku.txt', '2702_sale.txt']

router.get('/', (req, res, next) => {
  let dateRange = [req.query.startDate, req.query.endDate]
  let reportQueries = [
    clientQueries.getClientReport(),
    productQueries.getProductReport(),
    invoiceQueries.getInvoiceReport(...dateRange),
  ]
  let archive = archiver('zip')
  return Promise.each(reportQueries, (dataset, index) => {
    archive.append(generateTextData(dataset, sequences[index]), {
      name: reportNames[index],
    })
    return Promise.resolve()
  })
    .then(() => {
      let eventListener = new Promise((resolve, reject) => {
        archive.on('warning', error => {
          logging.error(
            error,
            'Warning encountered during archiving operations'
          )
          return reject(error)
        })
        archive.on('error', error => {
          logging.error(error, 'Error encountered during archiving operations')
          return reject(error)
        })
        archive.on('end', () => resolve)
      })
      archive.pipe(res)
      archive.finalize()
      return eventListener
    })
    .then(() => {
      return Promise.resolve()
    })
    .catch(error => next(error))
})

module.exports = router

function generateTextData (data, sequence) {
  let textData = ''
  data.forEach(entry => {
    sequence.forEach((fieldName, index) => {
      let isNull = entry[fieldName] === null
      let isUndefined = entry[fieldName] === undefined
      let fieldValue = isNull || isUndefined ? '' : entry[fieldName].toString()
      if (index === sequence.length - 1) {
        textData += fieldValue + '\r\n'
      } else {
        textData += fieldValue + ','
      }
    })
  })
  // return textData
  return encoding.convert(textData, 'BIG5')
}
