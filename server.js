#!/usr/bin/env node

// load npm modules
const express = require('express')
const http = require('http')
const Promise = require('bluebird')

// load controller modules
const db = require('./controllers/database')
const logging = require('./controllers/logging')
const webpack = require('./controllers/webpack')
const routing = require('./controllers/routing')

logging.warning('Loading custom configurations')
const appConfig = require('./config/app')
const eVars = appConfig.eVars

logging.warning('Initialize Express.js Framework')
let app = express()
app.set('port', appConfig.port)
app.set('trust proxy', true)
let server = http.createServer(app) // Create HTTP server

logging.warning('initialize essential system components - pre-startup')
let preStartupInitSequence = [
  webpack(app),
  routing(app),
  db.initialize(),
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
    logging.warning('Start server')
    server.listen(appConfig.port)
    return Promise.resolve()
  })
  .then(() => {
    logging.warning('Start server event handler')
    server.on('listening', () => {
      let addr = server.address()
      let bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port
      logging.warning(`Server started in [${eVars.NODE_ENV}] mode and listening on ` + bind)
    })
    server.on('error', error => {
      if (error.syscall !== 'listen') throw error
      switch (error.code) {
        case 'EACCES':
          logging.error(`${appConfig.port} requires elevated privileges`)
          process.exit(1)
        case 'EADDRINUSE':
          logging.error(`${appConfig.port} is already in use`)
          process.exit(1)
        default: throw error
      }
    })
    return Promise.resolve()
  })
  .then(() => {
    logging.warning('initialize other system components - post-startup')
    let postStartupInitSequence = [
      db.hydrateWorkingData(),
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
