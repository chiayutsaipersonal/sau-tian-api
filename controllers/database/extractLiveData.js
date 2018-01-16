const DbfParser = require('node-dbf-iconv')
const fs = require('fs-extra')
const path = require('path')
const Promise = require('bluebird')

const logging = require('../../controllers/logging')

const eVars = require('../../config/app').eVars

const location = eVars.LIVE_DATA_LOCATION
const convFactorLocation = path.resolve('./data/conversionFactors.json')
const customSalesDataLocation = path.resolve('./data/customSalesData.json')

module.exports = () => {
  let data = {
    clients: [],
    products: [],
    invoices: [],
    sales: [],
    conversionFactors: [],
    customSalesData: [],
  }

  let parsers = {
    clients: createParser(path.join(location, 'customer.DBF'), 'big5'),
    products: createParser(path.join(location, 'item.DBF'), 'big5'),
    invoices: createParser(path.join(location, 'sal.DBF'), 'big5'),
    sales: createParser(path.join(location, 'saldet.DBF'), 'big5'),
  }

  parsers.clients.on('record', record => {
    recordClientData(record, data.clients)
  })
  parsers.products.on('record', record => {
    recordProductData(record, data.products)
  })
  parsers.invoices.on('record', record => {
    recordInvoiceData(record, data.invoices)
  })
  parsers.sales.on('record', record => {
    recordSalesData(record, data.sales)
  })

  let endEventHandles = {
    clients: getEndEventHandle(parsers.clients),
    products: getEndEventHandle(parsers.products),
    invoices: getEndEventHandle(parsers.invoices),
    sales: getEndEventHandle(parsers.sales),
  }
  parsers.clients.parse()
  parsers.products.parse()
  parsers.invoices.parse()
  parsers.sales.parse()

  return Promise
    .all([
      endEventHandles.clients,
      endEventHandles.products,
      endEventHandles.invoices,
      endEventHandles.sales,
    ])
    .then(() => {
      return fs
        .readJSON(convFactorLocation)
        .then(recordset => {
          if (Array.isArray(recordset)) {
            recordset.forEach(record => {
              data.conversionFactors.push({
                id: record.id,
                productId: record.productId,
                conversionFactor: parseFloat(record.conversionFactor),
              })
            })
          }
          return Promise.resolve()
        }).catch(error => {
          logging.error(error, 'conversionFactors.json data extraction failure')
          return Promise.reject(error)
        })
    })
    .then(() => {
      return fs
        .readJSON(customSalesDataLocation)
        .then(recordset => {
          if (Array.isArray(recordset)) {
            recordset.forEach(record => {
              data.customSalesData.push({
                id: record.id,
                invoiceId: record.invoiceId,
                clientId: record.clientId,
                salesId: record.salesId,
                productId: record.productId,
                conversionFactorId: record.conversionFactorId,
                unitPrice: record.unitPrice ? parseFloat(record.unitPrice) : null,
                _preserved: record._preserved,
                _clientId: record._clientId,
                _unitPrice: record._unitPrice ? parseFloat(record._unitPrice) : null,
                _quantity: record._quantity ? parseFloat(record._quantity) : null,
                _employeeId: record._employeeId,
              })
            })
          }
          return Promise.resolve()
        }).catch(error => {
          logging.error(error, 'conversionFactors.json data extraction failure')
          return Promise.reject(error)
        })
    })
    .then(() => {
      logging.console('Live data extracted')
      return Promise.resolve(data)
    })
    .catch(error => {
      logging.error(error, 'Live data extraction failure')
      return Promise.reject(error)
    })
}

function createParser (dataSourcePath, encoding) {
  return new DbfParser(dataSourcePath, { encoding: encoding })
}

function recordClientData (record, clientRecords) {
  if (!record['@deleted']) {
    clientRecords.push({
      id: record.CUSTNO,
      name: record.CUSTABBR.trim() === '' ? null : record.CUSTABBR.toString(),
      contact: record.CON1.trim() === '' ? null : record.CON1.toString(),
      registrationId: record.UNIFORM.trim() === '' ? null : record.UNIFORM.toString(),
      zipCode: record.COMPZIP.trim() === '' ? null : record.COMPZIP.toString(),
      areaId: record.AREANO.trim() === '' ? null : parseInt(record.AREANO),
      address: record.COMPADDR.trim() === '' ? null : record.COMPADDR.toString(),
      telephone: record.TEL1.trim() === '' ? null : record.TEL1.toString(),
      fax: record.FAX.trim() === '' ? null : record.FAX.toString(),
    })
  }
}

function recordProductData (record, invoiceRecords) {
  if (!record['@deleted']) {
    invoiceRecords.push({
      id: record.ITEMNO,
      sapId: record.SITEMNO.trim() === '' ? null : record.SITEMNO.toString(),
      name: record.ITEMNAME.trim() === '' ? null : record.ITEMNAME.toString(),
      stockQty: isNaN(record.STOCKQTY) ? null : parseInt(record.STOCKQTY),
      unit: record.STKUNIT.trim() === '' ? null : record.STKUNIT.toString(),
    })
  }
}

function recordInvoiceData (record, invoiceRecords) {
  if (!record['@deleted']) {
    let year = record.DATE2.trim() === '' ? null : record.DATE2.slice(0, 4)
    let month = record.DATE2.trim() === '' ? null : record.DATE2.slice(4, 6)
    let day = record.DATE2.trim() === '' ? null : record.DATE2.slice(6)
    invoiceRecords.push({
      id: record.SNO,
      date: record.DATE2.trim() === '' ? null : `${year}-${month}-${day}`,
      clientId: record.CUSTNO === '' ? null : record.CUSTNO.toString(),
      employeeId: record.EMPNO.trim() === '' ? null : record.EMPNO.toString(),
    })
  }
}

function recordSalesData (record, salesRecords) {
  if (
    (!record['@deleted']) &&
    // skipping products that does not actually exist in the items data table
    // hardcoded according to the actual data
    (record.ITEMNO !== 'G-85034') &&
    (record.ITEMNO !== 'B890393') &&
    (record.ITEMNO !== 'B25290')
  ) {
    salesRecords.push({
      id: record.BNO,
      invoiceId: record.SNO,
      productId: record.ITEMNO,
      quantity: isNaN(record.QTY) ? null : parseInt(record.QTY),
      unitPrice: isNaN(record.PRICE) ? null : parseInt(record.PRICE),
    })
  }
}

function getEndEventHandle (parser) {
  return new Promise(resolve => { parser.on('end', resolve) })
}
