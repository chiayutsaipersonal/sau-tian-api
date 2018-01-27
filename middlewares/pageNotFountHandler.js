const path = require('path')

const logging = require('../controllers/logging')

const hostUrl = require('../config/app').hostUrl

module.exports = (req, res, next) => {
  logging.warning(`Page requested is missing: ${hostUrl}${req.originalUrl}`)
  return res
    .status(301)
    .type('text/html;charset=utf-8')
    .sendFile(path.resolve('./dist/index.html'))
}
