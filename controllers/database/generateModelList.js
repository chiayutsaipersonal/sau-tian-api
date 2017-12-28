const fs = require('fs-extra')

const logging = require('../logging')

module.exports = db => {
  let models = db.workingDataConfig.models
  return fs.readdir(models.location)
    .then(fileList => {
      models.files = fileList.filter(file => (
        (file.indexOf('.') !== 0) &&
        (file.slice(-3) === '.js'))
      )
      models.references = []
      models.files.forEach(file => {
        models.references.push(
          file.slice(0, -3).charAt(0).toUpperCase() +
          file.slice(0, -3).slice(1)
        )
      })
      return Promise.resolve()
    })
    .catch(error => {
      logging.error(error, 'Failure to read data models files')
      return Promise.reject(error)
    })
}
