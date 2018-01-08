const fs = require('fs-extra')

const db = require('../../controllers/database')
const logging = require('../../controllers/logging')

const notEqualTo = db.Sequelize.Op.ne

module.exports = {
  addConvFactorInfo,
  backupConvFactorData,
  extractConvFactorData,
  findDuplicates,
  getProduct,
  getProducts,
  recordCount,
  removeConvFactorInfo,
}

// add conversion factor info to a product record
function addConvFactorInfo ({ productId, conversionFactorId, conversionFactor }) {
  let clearQuery = `UPDATE products SET conversionFactorId = NULL, conversionFactor = NULL WHERE id = '${productId}' OR conversionFactorId = '${conversionFactorId}';`
  let updateQuery = `UPDATE products SET conversionFactorId = '${conversionFactorId}', conversionFactor = '${conversionFactor}' WHERE id = '${productId}'`
  return db.sequelize.transaction(transaction => {
    return db.sequelize.query(clearQuery, { transaction })
      .then(() => db.sequelize.query(updateQuery, { transaction }))
      .catch(error => {
        logging.error(error, 'modules/queries/products.addConvFactorInfo() errored')
        return Promise.reject(error)
      })
  })
}

// backup conversionFactor data
function backupConvFactorData (data) {
  return fs
    .outputJson('./data/disConFactor.json', data)
    .then(() => Promise.resolve())
    .catch(error => {
      logging.error(error, 'modules/queries/products.backupConvFactorData() errored')
      return Promise.reject(error)
    })
}

// extract conversionFactor information from products table
function extractConvFactorData () {
  return db.Products
    .findAll({
      where: {
        conversionFactorId: { [notEqualTo]: null },
      },
    })
    .then(data => {
      let mappedData = data.map(entry => {
        return {
          productId: entry.id,
          conversionFactorId: entry.conversionFactorId,
          conversionFactor: entry.conversionFactor,
        }
      })
      return Promise.resolve(mappedData)
    })
    .catch(error => {
      logging.error(error, 'modules/queries/products.extractConvFactorData() errored')
      return Promise.reject(error)
    })
}

// receives a productId and a conversionFactorId (3M productId)
// query for a list of productId's which carries the same conversionFactorId
// excluding the search target productId
function findDuplicates (productId, conversionFactorId) {
  return db.Products
    .findAll({
      where: {
        id: { [notEqualTo]: productId },
        conversionFactorId: conversionFactorId,
      },
    })
    .then(data => Promise.resolve(data))
    .catch(error => {
      logging.error(error, 'modules/queries/products.findDuplicates() errored')
      return Promise.reject(error)
    })
}

// find a product instance
function getProduct (productId) {
  return db.Products
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
      logging.error(error, 'modules/queries/products.getProduct() errored')
      return Promise.reject(error)
    })
}

// get product listing ordered by productId, and does
// server-side pagination if specified
function getProducts (limit = null, offset = null) {
  let options = { order: ['id'] }
  if (limit && offset) {
    options.limit = limit
    options.offset = offset
  }
  return db.Products
    .findAll(options)
    .then(data => Promise.resolve(data))
    .catch(error => {
      logging.error(error, 'modules/queries/products.getProducts() errored')
      return Promise.reject(error)
    })
}

// query for current record count
function recordCount () {
  return db.sequelize
    .query('SELECT id FROM products;')
    .spread((data, meta) => Promise.resolve(data.length))
    .catch(error => {
      logging.error(error, 'modules/queries/products.recordCount() errored')
      return Promise.reject(error)
    })
}

// remove conversion factor information from specified product record
function removeConvFactorInfo (productInstance) {
  return productInstance
    .update({
      conversionFactorId: null,
      conversionFactor: null,
    })
    .then(() => Promise.resolve())
    .catch(error => {
      logging.error(error, 'modules/queries/products.removeConvFactorInfo() errored')
      return Promise.reject(error)
    })
}
