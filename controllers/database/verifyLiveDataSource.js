const dotEnv = require('dotenv')
const fs = require('fs-extra')
const path = require('path')
const Promise = require('bluebird')

const logging = require('../logging')

dotEnv.config()
const eVars = process.env

const liveDataFiles = [
  path.join(path.resolve(eVars.LIVE_DATA_LOCATION), 'customer.DBF'),
  path.join(path.resolve(eVars.LIVE_DATA_LOCATION), 'item.DBF'),
  path.join(path.resolve(eVars.LIVE_DATA_LOCATION), 'sal.DBF'),
  path.join(path.resolve(eVars.LIVE_DATA_LOCATION), 'saldet.DBF'),
  // path.resolve('./data/conversionFactors.json'),
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
