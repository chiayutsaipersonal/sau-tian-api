module.exports = (req, res, next) => {
  if ((req.hostname === 'localhost') && (req.ip === '127.0.0.1')) {
    let error = new Error('Accessible only from localhost')
    error.status = 401
    return next(error)
  } else {
    return next()
  }
}
