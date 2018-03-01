// const fs = require('fs-extra')
const Promise = require('bluebird')

const logging = require('../logging')

module.exports = (db, liveData) => {
  let datasets = [
    liveData.clients,
    liveData.products,
    liveData.invoices,
    liveData.sales,
  ]
  let models = [db.Clients, db.Products, db.Invoices, db.Sales]
  return Promise.each(datasets, (dataset, index) => {
    return models[index]
      .bulkCreate(dataset)
      .then(() => {
        logging.console(
          `Working '${
            Object.keys(liveData)[index]
          }' datasets built successfully`
        )
        return Promise.resolve()
      })
      .catch(error => {
        logging.error(
          error,
          `Failure building working '${Object.keys(liveData)[index]}' datasets`
        )
        console.dir(Object.keys(error))
        console.log(error.errors)
        console.log(error.fields)
        // console.log(error.parent)
        // console.log(error.original)
        // console.log(error.sql)
        return Promise.reject(error)
      })
  })
    .then(() => {
      // // *** should keep in case more data abnormality arises in the future ***
      // // for debugging db.Sales model workingData building purpose -
      // // in order to find out about what records are in violation of fk constraint
      // // shouldn't use this in production, too many records to write
      // // causing lengthy startup
      // return Promise
      //   .each(liveData.sales, (salesRecord, index) => {
      //     if (
      //       (salesRecord.productId === 'G-85034') ||
      //       (salesRecord.productId === 'B890393') ||
      //       (salesRecord.productId === 'B25290')
      //     ) {
      //       return Promise.resolve()
      //     }
      //     return db.Sales
      //       .create(salesRecord)
      //       .catch(error => {
      //         console.dir(Object.keys(error))
      //         console.log(error.errors)
      //         console.log(error.fields)
      //         // console.log(error.parent)
      //         // console.log(error.original)
      //         console.log(error.sql)
      //         return Promise.reject(error)
      //       })
      // })
      return Promise.resolve()
    })
    .then(() => {
      // // for reloading data from './data/conversionFactors.json'
      // return db.ConversionFactors
      //   .destroy({ where: {} })
      //   .then(() => {
      //     return Promise.each(liveData.conversionFactors, record => {
      //       return db.Products
      //         .findById(record.productId)
      //         .then(product => {
      //           if (!product) {
      //             logging.warning(`秀田 POS 系統產品資料中未發現對應產品編號: '${record.productId}'`)
      //             return Promise.resolve()
      //           } else {
      //             return db.ConversionFactors.upsert({
      //               id: record.id,
      //               productId: record.productId,
      //               conversionFactor: record.conversionFactor,
      //             }).catch(error => {
      //               console.dir(Object.keys(error))
      //               console.log(error.errors)
      //               console.log(error.fields)
      //               // console.log(error.parent)
      //               // console.log(error.original)
      //               console.log(error.sql)
      //               return Promise.reject(error)
      //             })
      //           }
      //         }).catch(error => Promise.reject(error))
      //     }).then(() => {
      //       return db.ConversionFactors.findAll()
      //     }).then(data => {
      //       return fs.outputJson('./data/conversionFactors.json', data)
      //     }).then(() => {
      //       logging.console('Working \'ConversionFactors\' datasets built successfully')
      //       return Promise.resolve()
      //     }).catch(error => Promise.reject(error))
      //   })
      return Promise.resolve()
    })
    .then(() => {
      db.ready = true
      logging.console('Working dataset built')
      return Promise.resolve()
    })
    .catch(error => {
      logging.error(error, 'failure building working datasets')
      return Promise.reject(error)
    })
}
