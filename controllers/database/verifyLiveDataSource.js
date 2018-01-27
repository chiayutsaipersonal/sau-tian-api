require('dotenv').config()
const fs = require('fs-extra')
const path = require('path')
const Promise = require('bluebird')

const logging = require('../logging')

const location = process.env.LIVE_DATA_LOCATION

const liveDataFiles = [
  path.join(path.resolve(location), 'customer.DBF'),
  path.join(path.resolve(location), 'item.DBF'),
  path.join(path.resolve(location), 'sal.DBF'),
  path.join(path.resolve(location), 'saldet.DBF'),
]

module.exports = () => {
  return Promise
    .each(liveDataFiles, file => validatePath(file))
    .then(() => {
      logging.warning('Live data source verification successful')
      return Promise.resolve()
    })
    .catch(error => {
      logging.error(error, 'Live data source verification failure')
      return Promise.reject(error)
    })
}

function validatePath (filePath) {
  return fs.pathExists(filePath)
    .then(result => {
      if (result) {
        logging.console(`${filePath} is verified`)
        return Promise.resolve()
      } else {
        let error = new Error(`${filePath} does not exist`)
        return Promise.reject(error)
      }
    }).catch(error => Promise.reject(error))
}
