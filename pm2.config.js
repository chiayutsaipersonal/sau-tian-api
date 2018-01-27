require('dotenv').config()

module.exports = {
  apps: [{
    name: 'sau-tian-api',
    script: 'server.js',
    port: 9003,
    watch: true,
    error_file: 'error.log',
    out_file: 'out.log',
  }],
}
