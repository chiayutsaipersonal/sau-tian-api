const path = require('path')

const logging = require('../logging')

module.exports = db => {
  let models = db.workingDataConfig.models
  models.references.forEach((reference, index) => {
    let modelPath = path.join(models.location, models.files[index])
    db[reference] = require(modelPath)(db.sequelize, db.Sequelize)
    logging.console(`${reference} model is registered`)
  })
  return Promise.resolve()
}
