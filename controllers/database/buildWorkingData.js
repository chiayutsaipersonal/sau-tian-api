const ora = require('ora')
const Promise = require('bluebird')

const logging = require('../logging')

module.exports = (db, liveData) => {
  let spinner = ora('Building workingDatabase...')
  spinner.start()
  let datasets = [
    liveData.clients,
    liveData.products,
    liveData.invoices,
    liveData.sales,
  ]
  let correspondingModels = [
    db.Clients,
    db.Products,
    db.Invoices,
    db.Sales,
  ]
  return Promise.each(datasets, (dataset, index) => {
    return correspondingModels[index]
      .bulkCreate(dataset)
      .then(() => {
        spinner.stop()
        logging.console(`Working '${Object.keys(liveData)[index]}' datasets built successfully`)
        spinner = ora('Building workingDatabase...').start()
        return Promise.resolve()
      })
      .catch(error => {
        spinner.stop()
        logging.error(error, `Failure building working '${Object.keys(liveData)[index]}' datasets`)
        console.dir(Object.keys(error))
        console.log(error.errors)
        console.log(error.fields)
        // console.log(error.parent)
        // console.log(error.original)
        // console.log(error.sql)
        return Promise.reject(error)
      })
    /*
  }).then(() => {
    // for debugging db.Sales model workingData building purpose -
    // in order to find out about what records are in violation of fk constraint
    // shouldn't use this in production, too many records to write
    // causing lengthy startup
    return Promise
      .each(liveData.sales, (salesRecord, index) => {
        if (
          (salesRecord.productId === 'G-85034') ||
          (salesRecord.productId === 'B890393') ||
          (salesRecord.productId === 'B25290')
        ) {
          return Promise.resolve()
        }
        return db.Sales
          .create(salesRecord)
          .catch(error => {
            console.dir(Object.keys(error))
            console.log(error.errors)
            console.log(error.fields)
            // console.log(error.parent)
            // console.log(error.original)
            console.log(error.sql)
            return Promise.reject(error)
          })
      })
      */
  }).then(() => {
    // in order to prevent user input error
    // each record is checked before
    // writing to conversionFactors table
    // excluded records are displayed on screen
    return Promise
      .each(liveData.conversionFactors, (record, index) => {
        return db.Products
          .findById(record.productId)
          .then(result => {
            if (result) {
              return db.ConversionFactors
                .create(record)
                .catch(error => Promise.reject(error))
            } else {
              spinner.stop()
              logging.warning(`id: '${record.productId}' does not exist in db.Products`)
              return Promise.resolve()
            }
          })
          .catch(error => {
            console.dir(Object.keys(error))
            console.log(error.errors)
            console.log(error.fields)
            // console.log(error.parent)
            // console.log(error.original)
            console.log(error.sql)
            return Promise.reject(error)
          })
      })
      .then(() => Promise.resolve())
      .catch(error => Promise.reject(error))
  }).then(() => {
    spinner.stop()
    db.ready = true
    logging.console('Working dataset built')
    return Promise.resolve()
  }).catch(error => {
    spinner.stop()
    logging.error(error, 'failure building working datasets')
    return Promise.reject(error)
  })
}
