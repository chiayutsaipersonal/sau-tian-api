module.exports = (req, res, next) => {
  let error = new Error('Not implemented')
  error.status = 501
  return next(error)
}
