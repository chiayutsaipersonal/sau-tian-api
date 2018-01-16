const fs = require('fs-extra')

const db = require('../../controllers/database')
const logging = require('../../controllers/logging')

module.exports = {
  insertProduct,
  insertConversionFactor,
  backupConvFactorData,
  findDuplicates,
  getProduct,
  getProducts,
  recordCount,
  removeConvFactorInfo,
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

// insert a conversion factor record
// all related records are removed before hand
// e.g. same productId or same conversion factor Id
function insertConversionFactor ({ productId = null, conversionFactorId = null, conversionFactor = null }) {
  if (
    (productId === null) ||
    (conversionFactorId === null) ||
    (conversionFactor === null)
  ) {
    let error = new Error('Function parameter requirement(s) not met')
    error.status = 400
    return Promise.reject(error)
  }
  return db.sequelize.transaction(transaction => {
    let deleteQuery = `DELETE FROM conversionFactors WHERE productId = '${productId}' OR  id = '${conversionFactorId}';`
    let insertQuery = `INSERT INTO conversionFactors (id, productId, conversionFactor) VALUES ('${conversionFactorId}', '${productId}', ${conversionFactor});`
    return db.sequelize
      .query(deleteQuery, { transaction })
      .then(() => db.sequelize.query(insertQuery, { transaction }))
  }).catch(error => {
    logging.error(error, './modules/queries/products.insertConversionFactor() errored')
    return Promise.reject(error)
  })
}

// backup conversionFactor data
function backupConvFactorData (data) {
  return db.ConversionFactors
    .findAll()
    .then(data => fs.outputJson('./data/conversionFactors.json', data))
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
  return db.sequelize
    .findById(productId)
    .then(productInstance => {
      if (!productInstance) {
        let error = new Error(`Specifiec product (id: '${productId}') does not exist`)
        error.status = 400
        return Promise.reject(error)
      } else {
        return Promise.resolve(productInstance)
      }
    })
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
