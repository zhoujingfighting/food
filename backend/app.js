const path = require('path')
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
// const sqlite = require('sqlite')
const port = 5000
const userAccountMiddleware = require('./user-account')
const restaurantMiddleware = require('./restaurant')
const app = express()
app.use((req,res,next) => {
    console.log(req.method,req.url)
    next()
    //next用法
})
app.use(cors({
    allow:true,
    maxAge:86400,
    credentials:true
    //这三个字段是为了实现跨域
    }))
app.use(cookieParser('secret'))
app.use(express.static(__dirname + '/static'))//处理静态请求中间件
app.use(express.urlencoded({//扩展url编码请求体
    extended : true,
}))
app.use(express.json())//用来解析json请求体
app.use('/api',userAccountMiddleware)//后端接口的请求 
app.use('/api',restaurantMiddleware)//后端接口的请求 

app.listen(port ,() => {
    console.log( 'server listening on port 5000' )
})