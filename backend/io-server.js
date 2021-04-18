const io = require('socket.io')
const httpserver = require('./http-server')
var ioServer = io(httpserver)

module.exports = ioServer