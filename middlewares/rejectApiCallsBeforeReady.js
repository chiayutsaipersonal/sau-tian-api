const db = require('../controllers/database')

// check 'ready' state of live data, reject request if live data is not ready
module.exports = (req, res, next) => {
  if (db.ready) return next()
  let error = new Error('Live data is not ready')
  error.status = 503
  return next(error)
}
