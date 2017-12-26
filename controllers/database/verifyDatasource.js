const fs = require('fs-extra')
const path = require('path')
const Promise = require('bluebird')

const config = require('../../config/database').liveData

const logging = require('../logging')

module.exports = () => {
  return getTablePaths()
    .then(pathsToVerify => {
      pathsToVerify.push(path.resolve(config.disConFactorFile))
      return Promise.each(pathsToVerify, (path, index) => {
        return fs.pathExists(path)
          .then(result => {
            if (result) {
              logging.console(`${path} is verified`)
              return Promise.resolve()
            } else {
              let error = new Error(`${path} does not exist`)
              return Promise.reject(error)
            }
          }).catch(error => Promise.reject(error))
      }).catch(error => Promise.reject(error))
    }).catch(error => {
      logging.error(error, 'Live data source verification failure')
      return Promise.reject(error)
    })
}

function getTablePaths () {
  return Promise.resolve(config.tables.map(table => {
    return path.resolve(path.join(config.path, table.tableName))
  }))
}
