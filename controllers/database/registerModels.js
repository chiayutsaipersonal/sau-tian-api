const path = require('path')

const logging = require('../logging')

module.exports = db => {
  let models = db.config.models
  models.modelReferences.forEach((modelReference, index) => {
    let modelPath = path.join(models.path, models.fileNames[index])
    db[modelReference] = require(modelPath)(db.sequelize, db.Sequelize)
    logging.console(`${modelReference} model is registered`)
  })
  return Promise.resolve()
}
