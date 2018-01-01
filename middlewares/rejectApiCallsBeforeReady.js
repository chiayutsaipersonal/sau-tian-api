const db = require('../controllers/database')

// check 'ready' state of live data, reject request if live data is not ready
module.exports = (req, res, next) => {
  if (db.ready) return next()
  res.status(503)
  let error = new Error('Live data is not ready')
  return next(error)
}
