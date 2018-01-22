const bodyParser = require('body-parser')
const cors = require('cors')
const express = require('express')
const favicon = require('serve-favicon')
const logger = require('morgan')
const path = require('path')

const logging = require('../controllers/logging')

const appConfig = require('../config/app')
const eVars = appConfig.eVars

logging.console('Loading route handlers')
const index = require('../routes/index')
const clients = require('../routes/clients')
const products = require('../routes/products')
const invoices = require('../routes/invoices')
const reloadPosData = require('../routes/reloadPosData')

logging.console('Loading custom middlewares')
const renderErrorPage = require('../middlewares/renderErrorPage')
const missingApiEndpointHandler = require('../middlewares/missingApiEndpointHandler')
const rejectApiCallsBeforeReady = require('../middlewares/rejectApiCallsBeforeReady')
const apiResponseHandler = require('../middlewares/apiResponseHandlers')
const pageNotFoundHandler = require('../middlewares/pageNotFountHandler')

const apiRouter = express.Router()

module.exports = app => {
  return setupPreRoutingMiddlewares(app)
    .then(() => setupAppRouting(app))
    .then(() => setupPostRoutingMiddlewares(app))
    .then(() => Promise.resolve('Routing setup completed'))
}

function setupPreRoutingMiddlewares (app) {
  logging.console('Loading pre-routing global middlewares')
  if (eVars.NODE_ENV === 'production') app.use(favicon(path.resolve('./dist/static/favicon.ico')))
  if (eVars.NODE_ENV === 'development') {
    app.use(logger('dev'))
    app.use(cors())
  }
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(express.static(path.resolve('./dist/static'))) // serve static assets
  apiRouter.use(rejectApiCallsBeforeReady) // serve static assets
  return Promise.resolve()
}

function setupAppRouting (app) {
  logging.console('Routing setup')
  app.use(`/${appConfig.reference}`, index)
  app.use(`/${appConfig.reference}/api`, apiRouter)
  apiRouter.use('/clients', clients)
  apiRouter.use('/products', products)
  apiRouter.use('/invoices', invoices)
  apiRouter.use('/reloadPosData', reloadPosData)
  return Promise.resolve()
}

function setupPostRoutingMiddlewares (app) {
  logging.console('Loading post-routing global middlewares')
  apiRouter.use(apiResponseHandler.json)
  apiRouter.use(missingApiEndpointHandler) // capture fall-through missing api endpoint request
  apiRouter.use(apiResponseHandler.error)
  app.use(pageNotFoundHandler) // capture fall-through missing page request
  app.use(renderErrorPage) // error handler
  return Promise.resolve()
}
