#!/usr/bin/env node

// load npm packages
const express = require('express')
const favicon = require('serve-favicon')
const logger = require('morgan')
const http = require('http')
const path = require('path')
// const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser')

// load custom configurations
const config = require('./config/app')

// load controllers
const database = require('./controllers/database')
const logging = require('./controllers/logging')

// load route handlers
const index = require('./routes/index')
const users = require('./routes/users')

// instantiate express app
const app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'hbs')

// load pre-routing global middlewares
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
if (app.get('env') === 'development') app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
// app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')))

// application routing setup
app.use('/', index)
app.use('/users', users)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  let error = new Error('Not Found')
  error.status = 404
  next(error)
})

// error handler
app.use(function (error, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = error.message
  res.locals.error = req.app.get('env') === 'development' ? error : {}
  // render the error page
  res.status(error.status || 500)
  res.render('error')
})

// Get port from environment and store in Express
const port = normalizePort(config.hosting.port || '3000')
app.set('port', port)

// Create HTTP server.
const server = http.createServer(app)

// Listen on provided port, on all network interfaces
server.listen(port)

// Event listener for HTTP server "listening" event
server.on('listening', () => {
  let addr = server.address()
  let bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port
  logging.warning('Listening on ' + bind)
  return database
    .initialize()
    .then(message => {
      logging.warning(message)
      return Promise.resolve()
    })
    .catch(error => {
      logging.error(error, 'Database for working data initialization failure')
      process.exit(1)
    })
})

// Normalize a port into a number, string, or false
function normalizePort (val) {
  let port = parseInt(val, 10)
  if (isNaN(port)) return val // named pipe
  if (port >= 0) return port // port number
  return false
}

// Event listener for HTTP server "error" event
server.on('error', error => {
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
})

// event listeners to capture unhandled issues
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
