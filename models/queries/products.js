const db = require('../../controllers/database')
const logging = require('../../controllers/logging')

module.exports = {
  tableRecordCount: () => {
    return db.sequelize
      .query('SELECT products.* FROM products;')
      .spread((data, meta) => Promise.resolve(data.length))
      .catch(error => {
        logging.error(error, 'modules/queries/products.tableRecordCount errored')
        return Promise.reject(error)
      })
  },
}
