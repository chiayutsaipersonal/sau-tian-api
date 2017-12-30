const logging = require('../controllers/logging')

const protocol = require('../config/app').hosting.protocol
const domain = require('../config/app').hosting.domain
const port = require('../config/app').hosting.port

module.exports = (req, res, next) => {
  let message = `Page requested is missing: ${protocol}://${domain}:${port}${req.originalUrl}`
  let error = new Error(message)
  logging.warning(message)
  error.status = 404
  res.status(error.status)
  next(error)
}
