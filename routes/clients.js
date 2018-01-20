const express = require('express')

const clientQueries = require('../models/queries/clients')

const pagination = require('../middlewares/pagination')

const router = express.Router()

router
  // GET client listing (optional pagination)
  .get('/',
    pagination(clientQueries.recordCount),
    (req, res, next) => {
      let query = req.linkHeader
        ? clientQueries.getClients(req.queryOptions.limit, req.queryOptions.offset)
        : clientQueries.getClients()
      return query
        .then(data => {
          req.resJson = { data }
          next()
          return Promise.resolve()
        })
        .catch(error => next(error))
    }
  )
  // GET a simple client list of id, name, areaId without pagination
  .get('/simpleList',
    (req, res, next) => {
      return clientQueries
        .getSimpleClientList()
        .then(data => {
          req.resJson = { data }
          next()
          return Promise.resolve()
        })
        .catch(error => next(error))
    }
  )

module.exports = router
