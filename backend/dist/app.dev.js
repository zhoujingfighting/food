"use strict";

var express = require('express');

var http = require('http');

var app = express();
var server = http.createServer(app);

var cors = require('cors');

var cookieParser = require('cookie-parser'); // const sqlite = require('sqlite')


var io = require('socket.io');

var ioServer = io(server, {
  origins: ["http://localhost:3000"],
  handlePreflightRequest: function handlePreflightRequest(req, res) {
    res.writeHead(200, {
      "Access-Control-Allow-Origin": "http://localhost:3000",
      "Access-Control-Allow-Methods": "GET,POST",
      "Access-Control-Allow-Headers": "my-custom-header",
      "Access-Control-Allow-Credentials": true
    });
    res.end();
  }
});
global.ioServer = ioServer; //因为这个后面要用这个ioServer所以放在前面

var userAccountMiddleware = require('./user-account');

var restaurantMiddleware = require('./restaurant');

app.use(cors({
  origin: true,
  maxAge: 86400,
  credentials: true //这三个字段是为了实现跨域

}));
var port = 5000;
app.use(express.json());
app.use(function (req, res, next) {
  console.log(req.method, req.url);
  next(); //next用法
});
app.use(cookieParser('secret'));
app.use(express["static"](__dirname + '/static/')); //处理静态请求中间件

app.use('/uploader', express["static"](__dirname + '/uploader/')); //处理静态请求中间件

app.use(express.urlencoded({
  //扩展url编码请求体
  extended: true
}));
app.use(express.json()); //用来解析json请求体

app.use('/api', userAccountMiddleware); //后端接口的请求 

app.use('/api', restaurantMiddleware); //后端接口的请求 

server.listen(port, function () {
  console.log('server running on port 5000');
});