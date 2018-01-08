const express = require('express')

const db = require('../controllers/database')

const pagination = require('../middlewares/pagination')

const router = express.Router()

router
  // GET client listing
  .get('/',
    pagination(recordCount(db)),
    (req, res, next) => {
      const queryString = 'SELECT * FROM clients WHERE areaId BETWEEN 1 AND 4 ORDER BY id'
      let paginationString = req.linkHeader
        ? ` LIMIT ${req.queryOptions.limit} OFFSET ${req.queryOptions.offset};`
        : ';'
      return db.sequelize
        .query(queryString + paginationString)
        .spread((data, meta) => {
          req.resJson = { data }
          next()
          return Promise.resolve()
        })
        .catch(error => {
          return next(error)
        })
    }
  )

module.exports = router

function recordCount (db) {
  const queryString = 'SELECT * FROM clients WHERE areaId BETWEEN 1 AND 4;'
  return () => {
    return db.sequelize
      .query(queryString)
      .spread((data, meta) => Promise.resolve(data.length))
      .catch(error => Promise.reject(error))
  }
}
