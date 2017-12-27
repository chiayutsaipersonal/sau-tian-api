const chalk = require('chalk')

module.exports = {
  console: messageToConsole,
  warning: warningToConsole,
  error: errorToConsole,
  // reject: rejectPromise, // doesn't seem to work
  // resolve: resolvePromise, // doesn't seem to work
}

function messageToConsole (message) {
  return Object.prototype.toString.call(message) === '[object String]'
    ? console.log(message)
    : console.dir(message, { depth: null, colors: false })
}

function warningToConsole (warningMessage) {
  return Object.prototype.toString.call(warningMessage) === '[object String]'
    ? console.log(`${chalk.yellow.bold(warningMessage)}`)
    : console.dir(warningMessage, { depth: null, colors: true })
}

function errorToConsole (error, customMessage = null) {
  if (customMessage) {
    console.error(`${chalk.bgRed.bold(error.name)} - ${chalk.red.bold(customMessage)}`)
  } else {
    console.error(`${chalk.bgRed.bold(error.name)}`)
  }
  warningToConsole(error.message)
  warningToConsole(error.stack)
}

// doesn't seem to work
// function rejectPromise (customMessage = null) {
//   return error => {
//     errorToConsole(error, customMessage)
//     return Promise.reject(error)
//   }
// }

// doesn't seem to work
// function resolvePromise (customMessage = null) {
//   return resolved => {
//     if (customMessage) warningToConsole(customMessage)
//     return Promise.resolve(resolved)
//   }
// }
