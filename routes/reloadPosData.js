const express = require('express')

const db = require('../controllers/database')
const logging = require('../controllers/logging')

const router = express.Router()

router
  // induce app server to reload live POS data
  .get('/', (req, res, next) => {
    return db
      .initialize()
      .then(initMessage => {
        logging.warning(initMessage)
        return db.hydrateWorkingData().then(hydrateMessage => {
          logging.warning(hydrateMessage)
          req.resJson = { message: 'Live POS data reload complete...' }
          next()
          return Promise.resolve()
        })
      })
      .catch(error => next(error))
  })

module.exports = router
