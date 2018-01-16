#!/usr/bin/env node

// load npm packages
const bodyParser = require('body-parser')
const cors = require('cors')
const dotEnv = require('dotenv')
const express = require('express')
const favicon = require('serve-favicon')
const http = require('http')
const logger = require('morgan')
const path = require('path')
const Promise = require('bluebird')
const webpack = require('webpack')
const webpackConfigSource = require(path.resolve('../sau-tian-client/build/webpack.dev.conf'))
const webpackDevMiddleware = require('webpack-dev-middleware')
const webpackHotMiddleware = require('webpack-hot-middleware')

dotEnv.config()

// load custom configurations
const appConfig = require('./config/app')

// load controllers
const db = require('./controllers/database')
const logging = require('./controllers/logging')

// load custom middlewares
const renderErrorPage = require('./middlewares/renderErrorPage')
const missingApiEndpointHandler = require('./middlewares/missingApiEndpointHandler')
const rejectApiCallsBeforeReady = require('./middlewares/rejectApiCallsBeforeReady')
const apiResponseHandler = require('./middlewares/apiResponseHandlers')
const pageNotFoundHandler = require('./middlewares/pageNotFountHandler')

// load route handlers
const index = require('./routes/index')
const clients = require('./routes/clients')
const products = require('./routes/products')
const invoices = require('./routes/invoices')

// instantiate express app and create server instance
logging.warning('Initialize Express.js Framework')
let app = express()
let port = normalizePort(appConfig.hosting.port || '9003')
app.set('port', port)
let server = null
server = http.createServer(app) // Create HTTP server

// setup webpack dev server middlewares for HMR in development mode
if (process.env.NODE_ENV === 'development') {
  let webpackCompiler = null
  webpackConfigSource
    .then(webpackConfig => {
      webpackConfig.entry.app.push('webpack-hot-middleware/client?reload=true')
      webpackCompiler = webpack(webpackConfig)
      app.use(webpackDevMiddleware(webpackCompiler, {
        logLevel: 'warn',
        publicPath: webpackConfig.output.publicPath,
        stats: { colors: true },
      })
      )
      app.use(webpackHotMiddleware(webpackCompiler))
    })
}

// declare routers
const apiRouter = express.Router()

// load essential service components
logging.warning('initialize essential system components - pre-startup')
// set init sequence
let preStartupInitSequence = [
  db.initialize(), // working database
  'initialize essential systems 1...', // dummy stub
  'initialize essential systems 2...', // dummy stub
]
// run startup initialization in sequence
Promise
  .each(
    preStartupInitSequence,
    initResults => {
      logging.warning(initResults)
      return Promise.resolve()
    })
  .then(() => {
    logging.warning('Initialize Handlebars templating engine')
    app.set('views', path.join(__dirname, 'views'))
    app.set('view engine', 'hbs')
    return Promise.resolve()
  })
  .then(() => {
    logging.warning('Loading pre-routing global middlewares')
    /* npm modules */
    if (app.get('env') === 'production') app.use(favicon(path.join(__dirname, 'dist', 'public', 'favicon.ico')))
    if (app.get('env') === 'development') {
      app.use(logger('dev'))
      app.use(cors()) // enable CORS for all origins (no longer required once client is loaded from this server)
    }
    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({ extended: false }))
    /* serve static assets */
    app.use(express.static(path.join(__dirname, 'dist', 'public')))
    /* custom modules */
    apiRouter.use(rejectApiCallsBeforeReady)
    return Promise.resolve()
  })
  .then(() => {
    logging.warning('Routing setup')
    if (process.env.NODE_ENV !== 'development') app.use(`/${appConfig.reference}`, index)
    app.use(`/${appConfig.reference}/api`, apiRouter)
    apiRouter.use('/clients', clients)
    apiRouter.use('/products', products)
    apiRouter.use('/invoices', invoices)
    return Promise.resolve()
  })
  .then(() => {
    logging.warning('Loading post-routing global middlewares')
    apiRouter.use(apiResponseHandler.json)
    apiRouter.use(missingApiEndpointHandler) // capture fall-through missing api endpoint request
    apiRouter.use(apiResponseHandler.error)
    app.use(pageNotFoundHandler) // capture fall-through missing page request
    app.use(renderErrorPage) // error handler
    return Promise.resolve()
  })
  .then(() => {
    logging.warning('Start web server')
    server.listen(port) // Listen on provided port, on all network interfaces
    return Promise.resolve()
  })
  .then(() => {
    logging.warning('Start server error event handler')
    server.on('error', errorHandler)
    return Promise.resolve()
  })
  .then(() => {
    logging.warning('Start server listening event handler')
    server.on('listening', onListenHandler)
    return Promise.resolve()
  })
  .then(() => {
    logging.warning('initialize other system components - post-startup')
    let postStartupInitSequence = [ // set init sequence
      db.hydrateWorkingData(),
      'initialize other systems 1...', // dummy stub
      'initialize other systems 2...', // dummy stub
    ]
    return Promise.each(
      postStartupInitSequence,
      initResults => {
        logging.warning(initResults)
        return Promise.resolve()
      }
    ).then(() => {
      return Promise.resolve()
    }).catch(error => {
      logging.error(error, 'Post-startup initialization failure')
      return Promise.reject(error)
    })
  })
  .then(() => {
    logging.warning('System initialization completed')
    return Promise.resolve()
  })
  .catch(error => {
    logging.error(error)
    process.exit(1)
  })

// server listen event handler
function onListenHandler () {
  let addr = server.address()
  let bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port
  logging.warning(`Server started in [${process.env.NODE_ENV}] mode and listening on ` + bind)
}

// Normalize a port into a number, string, or false
function normalizePort (val) {
  let port = parseInt(val, 10)
  if (isNaN(port)) return val // named pipe
  if (port >= 0) return port // port number
  return false
}

// error handler script
function errorHandler (error) {
  if (error.syscall !== 'listen') throw error
  let bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port
  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      logging.error(bind + ' requires elevated privileges')
      process.exit(1)
    case 'EADDRINUSE':
      logging.error(bind + ' is already in use')
      process.exit(1)
    default:
      throw error
  }
}

// event listeners to capture unhandled events and issues
process.on('unhandledRejection', (error, promise) => {
  logging.error(error, '發現未處理的 Promise Rejection')
  return logging.warning(promise)
})

process.on('rejectionHandled', promise => {
  return logging.warning('Rejection handled !!!')
})

process.on('uncaughtException', error => {
  return logging.error(error, '發生未預期 exception !!!')
})
