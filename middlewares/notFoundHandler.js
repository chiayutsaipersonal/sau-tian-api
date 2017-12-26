const config = require('../config/app')
const logging = require('../controllers/logging')

module.exports = (req, res, next) => {
  let message = `不存在的頁面: ${config.hostUrl}${req.path}`
  let error = new Error(message)
  logging.warning(message)
  error.status = 404
  res.status(error.status)
  next(error)
}
