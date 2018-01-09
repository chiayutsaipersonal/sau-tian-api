const fs = require('fs-extra')
const uuidV4 = require('uuid/v4')

const db = require('../../controllers/database')
const logging = require('../../controllers/logging')

module.exports = {
  backupCustomInvoiceData,
  extractCustomDataFromLiveData,
  getCustomSalesData,
  getCustomSalesRecord,
  getIrreleventCustomData,
  getLiveData,
  prepCustomRecord,
  recordCustomData,
}

// get full dataset from customSalesData table
function getCustomSalesData () {
  return db.CustomSalesData
    .findAll()
}

// extract custom sales data from live invoice data
function extractCustomDataFromLiveData (liveData) {
  return Promise.resolve(liveData.map(entry => {
    return {
      id: entry.id,
      invoiceId: entry.invoiceId,
      clientId: entry.clientId,
      salesId: entry.salesId,
      productId: entry.productId,
      conversionFactorId: entry.conversionFactorId,
      unitPrice: entry.price,
      _preserved: entry._preserved,
      _clientId: entry._clientId,
      _unitPrice: entry._price,
      _quantity: entry._quantity,
      _employeeId: entry._employeeId,
    }
  }))
}

// update or insert custom sales data record
function recordCustomData (recordData) {
  return db.CustomSalesData
    .upsert(recordData)
    .then(() => Promise.resolve())
    .catch(error => {
      logging.error(error, 'modules/queries/invoices.recordCustomData() errored')
      return Promise.reject(error)
    })
}

// get customSalesData record by id
function getCustomSalesRecord (recordId) {
  return db.CustomSalesData
    .findById(recordId)
    .then(recordInstance => {
      if (!recordInstance) {
        let error = new Error(`Specifiec customRecord (id: '${recordId}') does not exist`)
        error.status = 400
        return Promise.reject(error)
      } else {
        return Promise.resolve(recordInstance)
      }
    })
    .catch(error => {
      logging.error(error, 'modules/queries/invoices.getCustomSalesRecord() errored')
      return Promise.reject(error)
    })
}

// backup custom invoice data
function backupCustomInvoiceData (data) {
  return fs
    .outputJson('./data/customSalesData.json', data)
    .then(() => Promise.resolve())
    .catch(error => {
      logging.error(error, 'modules/queries/invoices.backupCustomInvoiceData() errored')
      return Promise.reject(error)
    })
}

// get live invoice data jointed with custom data
// with data range specified
// *** any custom data that does not match to live data will not be found!!! ***
// *** e.g. when record from live source was changed ***
function getLiveData (startDate, endDate) {
  return db.sequelize
    .query(liveDataQueryString(startDate, endDate))
    .spread((data, meta) => Promise.resolve(data))
    .catch(error => {
      logging.error(error, 'modules/queries/invoices.getLiveData() errored')
      return Promise.reject(error)
    })
}

// get custom invoice data that's outside of the specified date range
function getIrreleventCustomData (startDate, endDate) {
  let query = `
    SELECT customSalesData.*
    FROM customSalesData
    INNER JOIN invoices ON customSalesData.invoiceId = invoices.id
    WHERE invoices.date NOT BETWEEN '${startDate}' AND '${endDate}';`
  return db.sequelize
    .query(query)
    .spread((data, meta) => Promise.resolve(data))
    .catch(error => {
      logging.error(error, 'modules/queries/invoices.getIrreleventCustomData() errored')
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
    products.conversionFactor,
    invoices.id AS invoiceId,
    clients.id AS clientId,
    sales.id AS salesId,
    products.id AS productId,
    products.conversionFactorId,
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
    LEFT JOIN
    customSalesData ON (customSalesData.invoiceId = invoices.id) AND
                      (customSalesData.clientId = invoices.clientId) AND
                      (customSalesData.salesId = sales.id) AND
                      (customSalesData.productId = sales.productId) AND
                      (customSalesData.conversionFactorId = products.conversionFactorId) AND
                      (customSalesData.unitPrice = sales.unitPrice)
  WHERE invoices.date BETWEEN '${startDate}' AND '${endDate}' AND
    products.conversionFactorId IS NOT NULL
  ORDER BY products.id,
      date;`
}

// prep record data from request POST data
// without empty fields
function prepCustomRecord (reqSubmission) {
  let requiredFields = ['id', 'invoiceId', 'clientId', 'salesId', 'productId', 'conversionFactorId', 'unitPrice']
  requiredFields.forEach(field => {
    if (customRecord[field] === undefined) {
      let error = new Error(`Required field '${field}' is missing`)
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
  if (reqSubmission.unitPrice !== undefined) customRecord._unitPrice = reqSubmission._unitPrice
  if (reqSubmission._quantity !== undefined) customRecord._quantity = reqSubmission._quantity
  if (reqSubmission._employeeId !== undefined) customRecord._employeeId = reqSubmission._employeeId
  return Promise.resolve(customRecord)
}
