const webpack = require('webpack')
const webpackDevMiddleware = require('webpack-dev-middleware')
const webpackHotMiddleware = require('webpack-hot-middleware')

const webpackConfigSource = require('../../sau-tian-client/build/webpack.dev.conf')
const eVars = require('../config/app').eVars

const logging = require('../controllers/logging')

module.exports = app => {
  if (eVars.NODE_ENV === 'production') return Promise.resolve('Skipping Webpack HMR initialization in production mode')
  logging.warning('Setup Webpack HMR')
  let webpackCompiler = null
  return webpackConfigSource
    .then(webpackConfig => {
      webpackConfig.entry.app.push('webpack-hot-middleware/client?reload=true')
      webpackCompiler = webpack(webpackConfig)
      app.use(webpackDevMiddleware(webpackCompiler, {
        logLevel: 'warn',
        publicPath: webpackConfig.output.publicPath,
        stats: { colors: true },
      }))
      app.use(webpackHotMiddleware(webpackCompiler))
      return Promise.resolve(`Webpack HMR activated in ${eVars.NODE_ENV} mode`)
    })
}
