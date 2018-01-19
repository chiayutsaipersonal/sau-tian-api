// const fs = require('fs-extra')
const uuidV4 = require('uuid/v4')

const db = require('../../controllers/database')
const logging = require('../../controllers/logging')

module.exports = {
  alignCustomSalesData,
  extractReqBodyData,
  extractWorkingData,
  getCustomSalesRecord,
  getLiveData,
  recordUpsert,
  // backupCustomSalesData,
  // getCustomSalesData,
  // getIrreleventCustomData,
}

// get customSalesData record by id
function getCustomSalesRecord (id) {
  return db.CustomSalesData
    .findById(id)
    .then(data => Promise.resolve(data || {}))
    .catch(error => {
      logging.error(error, 'modules/queries/invoices.getCustomSalesRecord() errored')
      return Promise.reject(error)
    })
}

// align custom sales data
// removing all data entries that are within the specified date range
// insert validated working data entries
function alignCustomSalesData (startDate, endDate, validatedData) {
  let deleteQuery = `DELETE FROM customSalesData WHERE invoiceId IN (SELECT id FROM invoices WHERE date BETWEEN '${startDate}' AND '${endDate}');`
  return db.sequelize.transaction(transaction => {
    return db.sequelize
      .query(deleteQuery, { transaction })
      .then(() => db.CustomSalesData.bulkCreate(validatedData, { transaction }))
      .catch(error => Promise.reject(error))
  }).catch(error => {
    logging.error(error, 'modules/queries/invoices.alignCustomSalesData() errored')
    return Promise.reject(error)
  })
}

// prep record data from request POST data
// without empty fields
function extractReqBodyData (reqSubmission) {
  let requiredFields = ['customSalesDataId', 'invoiceId', 'clientId', 'salesId', 'productId', 'conversionFactorId', 'unitPrice']
  requiredFields.forEach(field => {
    if (reqSubmission[field] === undefined) {
      let error = new Error(`Required field '${field}' is missing`)
      error.status = 400
      return Promise.reject(error)
    }
  })
  let customRecord = {}
  customRecord.id = !reqSubmission.customSalesDataId
    ? uuidV4().toUpperCase()
    : reqSubmission.customSalesDataId
  customRecord.invoiceId = reqSubmission.invoiceId
  customRecord.clientId = reqSubmission.clientId
  customRecord.salesId = reqSubmission.salesId
  customRecord.productId = reqSubmission.productId
  customRecord.conversionFactorId = reqSubmission.conversionFactorId
  customRecord.unitPrice = reqSubmission.unitPrice
  if (reqSubmission._preserved !== undefined) customRecord._preserved = reqSubmission._preserved
  if (reqSubmission._clientId !== undefined) customRecord._clientId = reqSubmission._clientId
  if (reqSubmission._unitPrice !== undefined) customRecord._unitPrice = reqSubmission._unitPrice
  if (reqSubmission._quantity !== undefined) customRecord._quantity = reqSubmission._quantity
  if (reqSubmission._employeeId !== undefined) customRecord._employeeId = reqSubmission._employeeId
  return Promise.resolve(customRecord)
}

// extract matched custom sales data from live invoice data
function extractWorkingData (liveData) {
  let extracted = []
  liveData.forEach(entry => {
    if (entry.customSalesDataId) {
      extracted.push({
        id: entry.customSalesDataId,
        invoiceId: entry.invoiceId,
        clientId: entry.clientId,
        salesId: entry.salesId,
        productId: entry.productId,
        conversionFactorId: entry.conversionFactorId,
        unitPrice: entry.unitPrice,
        _preserved: entry._preserved,
        _clientId: entry._clientId,
        _unitPrice: entry._unitPrice,
        _quantity: entry._quantity,
        _employeeId: entry._employeeId,
      })
    }
  })
  return Promise.resolve(extracted)
}

// get live invoice data jointed with custom data
// with data range specified
function getLiveData (startDate, endDate) {
  return db.sequelize
    .query(liveDataQueryString(startDate, endDate))
    .spread((data, meta) => Promise.resolve(data))
    .catch(error => {
      logging.error(error, 'modules/queries/invoices.getLiveData() errored')
      return Promise.reject(error)
    })
}

// return live data query SQL string
function liveDataQueryString (startDate, endDate) {
  return `
    SELECT invoices.date,
          products.name AS productName,
          sales.unitPrice,
          sales.quantity,
          invoices.employeeId,
          products.unit,
          clients.name AS companyName,
          clients.areaId,
          conversionFactors.conversionFactor,
          invoices.id AS invoiceId,
          clients.id AS clientId,
          sales.id AS salesId,
          products.id AS productId,
          conversionFactors.id AS conversionFactorId,
          products.sapId,
          customSalesData.id AS customSalesDataId,
          customSalesData._preserved,
          customSalesData._clientId,
          customSalesData._unitPrice,
          customSalesData._quantity,
          customSalesData._employeeId
    FROM invoices
        INNER JOIN
        clients ON clients.id = invoices.clientId
        INNER JOIN
        sales ON sales.invoiceId = invoices.id
        INNER JOIN
        products ON products.id = sales.productId
        INNER JOIN
        conversionFactors ON conversionFactors.productId = products.id
        LEFT JOIN
        customSalesData ON (customSalesData.invoiceId = invoices.id) AND
                            (customSalesData.clientId = invoices.clientId) AND
                            (customSalesData.salesId = sales.id) AND
                            (customSalesData.productId = sales.productId) AND
                            (customSalesData.conversionFactorId = conversionFactors.id) AND
                            (customSalesData.unitPrice = sales.unitPrice)
    WHERE invoices.date BETWEEN '${startDate}' AND '${endDate}'
    ORDER BY products.id,
            date;`
}

// update or insert custom sales data record
function recordUpsert (recordData) {
  return db.CustomSalesData
    .upsert(recordData)
    .then(() => Promise.resolve())
    .catch(error => {
      logging.error(error, 'modules/queries/invoices.record() errored')
      return Promise.reject(error)
    })
}

// // backup custom invoice data
// function backupCustomSalesData (data) {
//   return db.CustomSalesData
//     .findAll()
//     .then(data => fs.outputJson('./data/customSalesData.json', data))
//     .then(() => Promise.resolve())
//     .catch(error => {
//       logging.error(error, 'modules/queries/invoices.backupCustomInvoiceData() errored')
//       return Promise.reject(error)
//     })
// }

// // get full dataset from customSalesData table
// function getCustomSalesData () {
//   return db.CustomSalesData
//     .findAll()
// }

// // get custom invoice data that's outside of the specified date range
// function getIrreleventCustomData (startDate, endDate) {
//   let query = `
//     SELECT customSalesData.*
//     FROM customSalesData
//     INNER JOIN invoices ON customSalesData.invoiceId = invoices.id
//     WHERE invoices.date NOT BETWEEN '${startDate}' AND '${endDate}';`
//   return db.sequelize
//     .query(query)
//     .spread((data, meta) => Promise.resolve(data))
//     .catch(error => {
//       logging.error(error, 'modules/queries/invoices.getIrreleventCustomData() errored')
//       return Promise.reject(error)
//     })
// }

// // return live data query SQL string
// function liveDataQueryString (startDate, endDate) {
//   return `
//     SELECT invoices.date,
//           products.name AS productName,
//           sales.unitPrice,
//           sales.quantity,
//           invoices.employeeId,
//           products.unit,
//           clients.name AS companyName,
//           clients.areaId,
//           conversionFactors.conversionFactor,
//           invoices.id AS invoiceId,
//           clients.id AS clientId,
//           sales.id AS salesId,
//           products.id AS productId,
//           conversionFactors.id AS conversionFactorId,
//           products.sapId,
//           customSalesData.id AS customSalesDataId,
//           customSalesData._preserved,
//           customSalesData._clientId,
//           customSalesData._unitPrice,
//           customSalesData._quantity,
//           customSalesData._employeeId
//     FROM invoices
//         INNER JOIN
//         clients ON clients.id = invoices.clientId
//         INNER JOIN
//         sales ON sales.invoiceId = invoices.id
//         INNER JOIN
//         products ON products.id = sales.productId
//         INNER JOIN
//         conversionFactors ON conversionFactors.productId = products.id
//         LEFT JOIN
//         customSalesData ON (customSalesData.invoiceId = invoices.id) AND
//                             (customSalesData.clientId = invoices.clientId) AND
//                             (customSalesData.salesId = sales.id) AND
//                             (customSalesData.productId = sales.productId) AND
//                             (customSalesData.conversionFactorId = conversionFactors.id) AND
//                             (customSalesData.unitPrice = sales.unitPrice)
//     WHERE invoices.date BETWEEN '${startDate}' AND '${endDate}'
//     ORDER BY products.id,
//             date;`
// }
