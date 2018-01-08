const db = require('../../controllers/database')
const logging = require('../../controllers/logging')

const between = db.Sequelize.Op.between

module.exports = {
  getClients,
  recordCount,
}

// get client listing ordered by clientId, and does
// server-side pagination if specified
function getClients (limit = null, offset = null) {
  let options = {
    where: {
      areaId: { [between]: [1, 4] },
    },
    order: ['id'],
  }
  if (limit && offset) {
    options.limit = limit
    options.offset = offset
  }
  return db.Clients
    .findAll(options)
    .then(data => Promise.resolve(data))
    .catch(error => {
      logging.error(error, 'modules/queries/products.getClients() errored')
      return Promise.reject(error)
    })
}

// query for record count
function recordCount () {
  return db.sequelize
    .query('SELECT * FROM clients WHERE areaId BETWEEN 1 AND 4;')
    .spread((data, meta) => Promise.resolve(data.length))
    .catch(error => {
      logging.error(error, 'modules/queries/clients.recordCount() errored')
      return Promise.reject(error)
    })
}
