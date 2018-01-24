const db = require('../../controllers/database')
const logging = require('../../controllers/logging')

const between = db.Sequelize.Op.between

module.exports = {
  getClients,
  getClientReport,
  getSimpleClientList,
  recordCount,
  checkExistence,
  rectifyString,
}

function getClientReport () {
  let queryOptions = {
    attributes: ['id', 'name', 'registrationId', 'contact', 'zipCode', 'address', 'telephone', 'fax'],
    where: { areaId: { [between]: [1, 4] } },
    order: ['id'],
  }
  return db.Clients
    .findAll(queryOptions, { logging: console.log })
    .then(queryResults => {
      return Promise.resolve(queryResults.map(entry => {
        return {
          distributorId: 400005,
          id: entry.id,
          name: rectifyString(checkExistence(entry.name, 'Empty Company Name')),
          registrationId: entry.registrationId,
          contact: rectifyString(entry.contact),
          zipCode: checkExistence(entry.zipCode, '00000'),
          address: rectifyString(checkExistence(entry.address, 'Empty Address')),
          telephone: rectifyString(entry.telephone),
          fax: rectifyString(entry.fax),
          type: null,
        }
      }))
    })
    .then(rawReportData => Promise.resolve(rawReportData))
    .catch(error => {
      logging.error(error, './modules/queries/products.getClientReport() errored')
      return Promise.reject(error)
    })
}

function checkExistence (dataValue, placeholder) {
  return dataValue === null ? placeholder : dataValue
}

function rectifyString (string) {
  if ((string === null) || (string === '')) {
    return string
  } else {
    return string.replace(',', '').replace('\'', '')
  }
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
  if ((limit !== null) && (offset !== null)) {
    options.limit = limit
    options.offset = offset
  }
  return db.Clients
    .findAll(options)
    .then(data => Promise.resolve(data))
    .catch(error => {
      logging.error(error, './modules/queries/products.getClients() errored')
      return Promise.reject(error)
    })
}

function getSimpleClientList () {
  let options = {
    where: {
      areaId: { [between]: [1, 4] },
    },
    attributes: ['id', 'name', 'areaId'],
    order: ['areaId', 'id'],
  }
  return db.Clients
    .findAll(options)
    .then(data => Promise.resolve(data))
    .catch(error => {
      logging.error(error, './modules/queries/products.getSimpleClientList() errored')
      return Promise.reject(error)
    })
}

// query for record count
function recordCount () {
  return db.sequelize
    .query('SELECT id FROM clients WHERE areaId BETWEEN 1 AND 4;')
    .spread((data, meta) => Promise.resolve(data.length))
    .catch(error => {
      logging.error(error, './modules/queries/clients.recordCount() errored')
      return Promise.reject(error)
    })
}
