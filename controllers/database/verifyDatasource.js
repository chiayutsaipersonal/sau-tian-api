const fs = require('fs-extra')
const path = require('path')
const Promise = require('bluebird')

const logging = require('../logging')

module.exports = db => {
  return getTableFilePaths(db.liveDataConfig)
    .then(pathsToVerify => {
      return Promise
        .each(pathsToVerify, filePath => validatePath(filePath))
        .catch(error => Promise.reject(error))
    })
    .catch(error => {
      logging.error(error, 'Live data source verification failure')
      return Promise.reject(error)
    })
}

function getTableFilePaths (args) {
  let tableFilePaths = []
  args.loadSequence.forEach(modelRef => {
    let fileName = args.tableLookup[modelRef]
    tableFilePaths.push(path.resolve(path.join(args.location, fileName)))
  })
  tableFilePaths.push(path.resolve(args.convFactorLocation))
  tableFilePaths.push(path.resolve(args.customDataLocation))
  return Promise.resolve(tableFilePaths)
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
