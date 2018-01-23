const express = require('express')
const fs = require('fs-extra')
const Promise = require('bluebird')

// const db = require('../controllers/database')
// const logging = require('../controllers/logging')

const clientQueries = require('../models/queries/clients')

const router = express.Router()

const clientDataSequence = ['distributorId', 'id', 'name', 'registrationId', 'contact', 'zipCode', 'address', 'telephone', 'fax', 'type']

router
  // induce app server to reload live POS data
  .get('/',
    (req, res, next) => {
      let clientReportName = '2702_cust.txt'
      // let productReportName = '2702_sku.txt'
      // let invoiceReportName = '2702_sale.txt'
      let reportQueries = [
        clientQueries.getClientReport(),
      ]
      return Promise
        .all(reportQueries)
        .spread(clientData => {
          let clientReportCvsData = generateTextData(clientData, clientDataSequence)
          return Promise.all([
            fs.outputFile(`./data/${clientReportName}`, clientReportCvsData),
          ])
        })
        .then(() => {
          req.resJson = { message: 'done' }
          next()
          return Promise.resolve()
        })
        .catch(error => next(error))
    }
  )

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
