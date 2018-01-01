const path = require('path')

const logging = require('../controllers/logging')

const protocol = require('../config/app').hosting.protocol
const domain = require('../config/app').hosting.domain
const port = require('../config/app').hosting.port

module.exports = (req, res, next) => {
  logging.warning(`Page requested is missing: ${protocol}://${domain}:${port}${req.originalUrl}`)
  return res
    .status(404)
    .type('text/html;charset=utf-8')
    .sendFile(path.resolve('./dist/public/index.html'))
}
