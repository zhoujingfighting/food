const fs  = require('fs')
const multer  = require('multer')
const md5 = require('md5')
const express = require('express')
const sharp = require('sharp')
const svgCaptcha = require('svg-captcha')
const fsp = fs.promises
const uploader = multer({
    dest:'./uploader/' ,
    preservePath:true
})
let db
// const dbPromise = require('./db')
// dbPromise.then(dbObject => {
//     db = dbObject
// })
(async function(){
    db = await require('./db')
}())

const changePasswordTokenMap = {}

const mailer = require('./mailer')
const app = express.Router()
app.route('/register')
    .post(uploader.single('avatar') , async (req,res,next) => {
        var regInfo = req.body
        console.log('register' ,regInfo)
        var user = await db.get('SELECT * FROM users where name=?' ,regInfo.name)
        if(user){
            if(req.file){
                await fsp.unlink(req.file.path)
            }
            res.status(401).json({
                code : -1 ,
                msg : '用户名已被占用'
            })
        }else{
            if(req.file){
                var imgBuf = await fsp.readFile(req.file.path)
                await sharp(imgBuf)
                    .resize(256)
                    .toFile(req.file.path)
            }
            await db.run('INSERT INTO users (name,email,password,title) VALUES (?,?,?,?)' ,
            regInfo.name ,regInfo.email ,regInfo.password ,regInfo.title)
            res.json({
                code :0 ,
                msg : '注册成功'
            })
        }
    })

app.get('/userinfo' ,async (req,res,next) => {
    var userid = req.cookies.userid
    console.log(req.cookies)
    if(userid){
        res.json(await db.get('SELECT id,name,title FROM users WHERE id=?',userid))
    }else{
        res.status(404).json({
            code : -1,
            msg:'不存在此餐厅'
        })
    }
})
app.route('/login')
    .post(async (req,res,next) => {
        var tryLogin  = req.body
        var user = await db.get('SELECT id,name,title FROM users WHERE name=? AND password=?' ,
        tryLogin.name ,tryLogin.password)
        if(user){
            res.cookie('userid',user.id)//不使用签名
            res.json({code:0 ,msg:'登陆成功',id:user.id})
        }else{
            res.status(403).json({
                code:-1,
                msg:'用户名和密码错误'
            })
        }
    })
app.get('/logout',(req,res,next) => {
    res.clearCookie('userid')
    res.json({
        code :0 ,
        msg:'登出成功'
    })
})
module.exports = app
    
 