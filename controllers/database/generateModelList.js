const fs = require('fs-extra')

const logging = require('../logging')

module.exports = db => {
  let models = db.config.models
  return fs.readdir(db.config.models.path)
    .then(fileList => {
      models.fileNames = fileList.filter(fileName => (
        (fileName.indexOf('.') !== 0) &&
        (fileName.slice(-3) === '.js'))
      )
      models.modelReferences = []
      models.fileNames.forEach(fileName => {
        models.modelReferences.push(
          fileName.slice(0, -3).charAt(0).toUpperCase() +
          fileName.slice(0, -3).slice(1)
        )
      })
      return Promise.resolve()
    })
    .catch(error => {
      logging.reject(error, 'Failure to read data models files')
      return Promise.reject(error)
    })
}
