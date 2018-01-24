const fs = require('fs-extra')
const moment = require('moment-timezone')
const path = require('path')
const Promise = require('bluebird')

const db = require('../../controllers/database')
const logging = require('../../controllers/logging')
const checkExistence = require('./clients').checkExistence
const rectifyString = require('./clients').rectifyString

module.exports = {
  backupConvFactorData,
  findDuplicates,
  getProduct,
  getProducts,
  batchSequentialInsert,
  insertProduct,
  insertConversionFactor,
  recordCount,
  removeConvFactorInfo,
  resetConversionFactors,
  getProductReport,
}

// get report data in javascript object format
function getProductReport () {
  let queryString = 'SELECT a.*, b.id AS \'conversionFactorId\', b.conversionFactor FROM products a INNER JOIN conversionFactors b ON a.id = b.productId ORDER BY a.id;'
  return db.sequelize
    .query(queryString)
    .spread((queryResults, meta) => {
      return Promise.resolve(queryResults.map(entry => {
        return {
          distributorId: 400005,
          id: entry.id,
          name: entry.name,
          length: null,
          width: null,
          conversionFactor: checkExistence(entry.conversionFactor, 1),
          unit: rectifyString(checkExistence(entry.unit, 'unspecified unit')),
          unitPrice: entry.unitPrice,
          conversionFactorId: entry.conversionFactorId,
          asp: null,
          stockQty: checkExistence(entry.stockQty, 0),
        }
      }))
    })
    .then(rawReportData => Promise.resolve(rawReportData))
    .catch(error => {
      logging.error(error, './modules/queries/products.getProductReport() errored')
      return Promise.reject(error)
    })
}

// clear existing conversion factor data
function resetConversionFactors () {
  return db.ConversionFactors
    .destroy({ where: {} })
    .then(() => Promise.resolve())
    .catch(error => {
      logging.error(error, './modules/queries/products.resetConvsionFactors() errored')
      return Promise.reject(error)
    })
}

// insert a product record
function insertProduct (record) {
  return db.Products
    .create(record)
    .then(() => Promise.resolve())
    .catch(error => {
      logging.error(error, './modules/queries/products.insert() errored')
      return Promise.reject(error)
    })
}

// batch insert product data sequentially
// each record is checked prior to insert to avoid constraint violation
// problematic records are skipped
function batchSequentialInsert (data) {
  let convertedData = JSON.parse(data)
  return Promise.each(convertedData, entry => {
    return getProduct(entry.productId)
      .then(product => {
        if (!product) {
          logging.warning(`'${entry.productId}' is not an existing product`)
          return Promise.resolve()
        } else {
          return insertConversionFactor(entry)
        }
      })
      .catch(error => Promise.reject(error))
  }).then(() => {
    return Promise.resolve()
  }).catch(error => {
    logging.error(error, './modules/queries/products.batchSequentialInsert() errored')
    return Promise.reject(error)
  })
}

// insert a conversion factor record
// all related records are removed before hand
// e.g. same productId or same conversion factor Id
function insertConversionFactor ({ id = null, productId = null, conversionFactor = null }) {
  if ((id === null) || (productId === null) || (conversionFactor === null)) {
    let error = new Error('Function parameter requirement(s) not met')
    error.status = 400
    return Promise.reject(error)
  }
  return db.sequelize.transaction(transaction => {
    let deleteQuery = `DELETE FROM conversionFactors WHERE productId = '${productId}' OR  id = '${id}';`
    let insertQuery = `INSERT INTO conversionFactors (id, productId, conversionFactor) VALUES ('${id}', '${productId}', ${conversionFactor});`
    return db.sequelize
      .query(deleteQuery, { transaction })
      .then(() => db.sequelize.query(insertQuery, { transaction }))
  }).catch(error => {
    logging.error(error, './modules/queries/products.insertConversionFactor() errored')
    return Promise.reject(error)
  })
}

// backup conversionFactor data
function backupConvFactorData () {
  let timeString = moment.tz().format('YYYYMMDDHHmmss')
  let location = path.resolve(`./data/conversionFactors.${timeString}.json`)
  return db.ConversionFactors
    .findAll()
    .then(data => fs.outputJson(location, data))
    .catch(error => {
      logging.error(error, './modules/queries/products.backupConvFactorData() errored')
      return Promise.reject(error)
    })
}

// receives a productId and a conversionFactorId (3M productId)
// query for a list of product records which carried the same conversionFactorId
// excluding the search target productId
function findDuplicates (productId, conversionFactorId) {
  let queryString = `SELECT a.*, b.id AS conversionFactorId, b.conversionFactor FROM products a LEFT JOIN conversionFactors b ON a.id = b.productId WHERE a.id != '${productId}' AND  b.id = '${conversionFactorId}';`
  return db.sequelize
    .query(queryString)
    .spread((data, meta) => Promise.resolve(data))
    .catch(error => {
      logging.error(error, './modules/queries/products.findDuplicates() errored')
      return Promise.reject(error)
    })
}

// find a product instance
function getProduct (productId) {
  return db.Products
    .findById(productId)
    .then(productInstance => Promise.resolve(productInstance))
    .catch(error => {
      logging.error(error, './modules/queries/products.getProduct() errored')
      return Promise.reject(error)
    })
}

// get product listing ordered by productId, and does
// server-side pagination if specified
function getProducts (limit = null, offset = null) {
  let queryString = 'SELECT a.*, b.id AS \'conversionFactorId\', b.conversionFactor FROM products a LEFT JOIN conversionFactors b ON a.id = b.productId ORDER BY a.id'
  queryString += ((limit !== null) && (offset !== null))
    ? ` LIMIT ${limit} OFFSET ${offset};`
    : ';'
  return db.sequelize
    .query(queryString)
    .spread((data, meta) => Promise.resolve(data))
    .catch(error => {
      logging.error(error, './modules/queries/products.getProducts() errored')
      return Promise.reject(error)
    })
}

// query for record count
function recordCount () {
  return db.sequelize
    .query('SELECT id FROM products;')
    .spread((data, meta) => Promise.resolve(data.length))
    .catch(error => {
      logging.error(error, './modules/queries/products.recordCount() errored')
      return Promise.reject(error)
    })
}

// remove conversion factor information from specified product record
function removeConvFactorInfo (productId) {
  return db.sequelize
    .query(`DELETE FROM conversionFactors WHERE productId = '${productId}';`)
    .then(() => Promise.resolve())
    .catch(error => {
      logging.error(error, './modules/queries/products.removeConvFactorInfo() errored')
      return Promise.reject(error)
    })
}
