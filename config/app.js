require('dotenv').config()
const eVars = process.env

// settings
const reference = 'sauTian'
const title = '秀田銷售資料拋轉程式'

const hosting = {
  development: {
    protocol: 'http',
    domain: 'localhost',
    port: 9003,
    timezone: 'Asia/Taipei',
  },
  staging: {
    protocol: 'http',
    domain: 'asjgroup.ddns.net',
    port: 9003,
    timezone: 'Asia/Taipei',
  },
  production: {
    protocol: 'http',
    domain: 'localhost',
    port: 9003,
    timezone: 'Asia/Taipei',
  },
}

const protocol = hosting[eVars.NODE_ENV].protocol
const domain = hosting[eVars.NODE_ENV].domain
const port = hosting[eVars.NODE_ENV].port
const timezone = hosting[eVars.NODE_ENV].timezone
const hostUrl = `${protocol}://${domain}:${port}/${reference}`

module.exports = {
  reference,
  title,
  hosting: {
    protocol,
    domain,
    port,
  },
  hostUrl,
  timezone,
}
