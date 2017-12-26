require('dotenv').config()

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

module.exports = {
  reference: 'sauTian',
  title: '秀田銷售資料拋轉程式',
  hosting: hosting[process.env.NODE_ENV],
}
