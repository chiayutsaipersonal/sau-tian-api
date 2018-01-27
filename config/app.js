require('dotenv').config()

const eVars = process.env

// settings
const reference = 'sauTian'
const title = '秀田銷售資料拋轉程式'

const timezone = 'Asia/Taipei'
const protocol = 'http'
const domain = 'localhost'
const port = 9003
const hostUrl = `${protocol}://${domain}:${port}`

module.exports = {
  eVars,
  protocol,
  domain,
  port,
  hostUrl,
  reference,
  timezone,
  title,
}
