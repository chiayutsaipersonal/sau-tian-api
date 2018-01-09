// const fs = require('fs-extra')
const uuidV4 = require('uuid/v4')

const db = require('../../controllers/database')
const logging = require('../../controllers/logging')

module.exports = {
  getLiveData,
  prepCustomRecord,
}

function getLiveData (startDate, endDate) {
  return db.sequelize
    .query(liveDataQueryString(startDate, endDate))
    .spread((data, meta) => Promise.resolve(data))
    .catch(error => {
      logging.error(error, 'modules/queries/invoices.getLiveData() errored')
      return Promise.reject(error)
    })
}

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

function prepCustomRecord (submission) {
  let customRecord = {}
  customRecord.invoiceId = submission.invoiceId
  customRecord.clientId = submission.clientId
  customRecord.salesId = submission.salesId
  customRecord.productId = submission.productId
  customRecord.conversionFactorId = submission.conversionFactorId
  customRecord.unitPrice = submission.unitPrice
  customRecord.id = submission.customSalesDataId !== null
    ? submission.customSalesDataId
    : uuidV4().toUpperCase()
  if (submission._preserved !== null) customRecord._preserved = submission._preserved
  if (submission._clientId !== null) customRecord._clientId = submission._clientId
  if (submission.unitPrice !== null) customRecord._unitPrice = submission._unitPrice
  if (submission._quantity !== null) customRecord._quantity = submission._quantity
  if (submission._employeeId !== null) customRecord._employeeId = submission._employeeId
  return Promise.resolve(customRecord)
}
