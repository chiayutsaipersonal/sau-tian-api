const logging = require('../controllers/logging')

module.exports = (error, req, res, next) => {
  logging.warning('Global routing error handler invoked')
  // set locals, only providing error in development
  res.locals.message = error.message
  res.locals.error = req.app.get('env') === 'development' ? error : {}
  // render the error page
  res.status(error.status || 500)
  res.render('error')
}
