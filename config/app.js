require('dotenv').config()

const reference = 'sauTian'
const title = '秀田銷售資料拋轉程式'

const hostingInformation = {
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

const protocol = hostingInformation[process.env.NODE_ENV].protocol
const domain = hostingInformation[process.env.NODE_ENV].domain
const port = hostingInformation[process.env.NODE_ENV].port
const timezone = hostingInformation[process.env.NODE_ENV].timezone
const hostUrl = `${protocol}://${domain}:${port}`

module.exports = {
  reference,
  title,
  hostingInformation: {
    protocol,
    domain,
    port,
  },
  hostUrl,
  timezone,
}
