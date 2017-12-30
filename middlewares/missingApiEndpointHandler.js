const logging = require('../controllers/logging')

module.exports = (req, res, next) => {
  let message = 'Received request on a missing API endpoint'
  logging.warning(message)
  let error = new Error(message)
  error.status = 404
  res.status(error.status)
  next(error)
}
