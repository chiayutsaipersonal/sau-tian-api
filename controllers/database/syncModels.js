const fs = require('fs-extra')
const path = require('path')
const Promise = require('bluebird')

const logging = require('../logging')

module.exports = (db, force = false) => {
  let pathToModels = path.join(__dirname, '../../models')
  return fs
    .readdir(pathToModels)
    .then(modelFiles => {
      let files = filterFiles(modelFiles)
      let modelRefs = processFileNames(files)
      return Promise.each(modelRefs, (modelRef, index) => {
        let modelPath = path.join(pathToModels, files[index])
        db[modelRef] = require(modelPath)(db.sequelize, db.Sequelize)
        let syncOperation = force
          ? db[modelRef].sync({ force: true })
          : db[modelRef].sync()
        return syncOperation.then(result => {
          logging.console(`${modelRef} table synchronized`)
          return Promise.resolve()
        }).catch(error => Promise.reject(error))
      }).then(() => {
        return Promise.resolve()
      }).catch(error => {
        logging.error(error, 'Working DB model synchronization failure')
        return Promise.reject(error)
      })
    })
}

function filterFiles (files) {
  return files.filter(fileName => {
    return ((fileName.indexOf('.') !== 0) && (fileName.slice(-3) === '.js'))
  })
}

function processFileNames (files) {
  let fileNames = []
  files.forEach(file => {
    fileNames.push(file.slice(0, -3).charAt(0).toUpperCase() + file.slice(0, -3).slice(1))
  })
  return fileNames
}
