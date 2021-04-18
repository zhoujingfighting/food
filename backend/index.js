const app = require('./app')
const httpServer = require('./http-server')
//express的request时间,就是传给http的
//服务端的io
const ioServer = require('./io-server')
httpServer.on('request' ,app)
//
const port = 5000
httpServer.listen( port ,()=>{
    console.log('port 5000 is running')
})