require('dotenv').config()
const eVars = process.env

const protocol = 'http'
const domain = 'localhost'
const port = 9003

module.exports = {
  eVars,
  protocol: 'http',
  domain: 'localhost',
  port: 9003,
  hostUrl: `${protocol}://${domain}:${port}`,
  reference: 'sauTian',
  timezone: eVars.TIMEZONE,
  title: '秀田銷售資料拋轉程式',
}
