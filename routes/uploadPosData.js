
const express = require('express')
const fs = require('fs-extra')
const path = require('path')
const multer = require('multer')({
  dest: path.resolve('./data'),
  fileFilter: (req, file, cb) => {
    if (!file.originalname.toLowerCase().match(/\.(dbf)$/)) {
      return cb(new Error('Invalid files'), false)
    }
    return cb(null, true)
  },
})
const Promise = require('bluebird')

const logging = require('../controllers/logging')

const router = express.Router()

router
  .post(
    '/',
    multer.array('livePosFiles', 4),
    (req, res, next) => {
      return Promise.each(req.files, file => {
        return fs
          .move(file.path, path.join(file.destination, file.originalname, { overwrite: true }))
          .then(() => {
            logging.warning(`${file.originalname} is uploaded`)
            return Promise.resolve()
          })
          .catch(error => {
            logging.error(error, `${file.originalname} upload failure`)
            return Promise.reject(error)
          })
      }).then(() => {
        req.resJson = { message: 'Live POS data upload completed...' }
        return next()
      }).catch(error => next(error))
    })

module.exports = router
