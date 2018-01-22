const express = require('express')
const path = require('path')

const router = express.Router()

// GET home page.
router.get('/', (req, res, next) => {
  return res
    .status(200)
    .type('text/html;charset=utf-8')
    .sendFile(path.resolve('./dist/index.html'))
  // .sendFile(path.resolve('./dist/public/index.html'))
})

module.exports = router
