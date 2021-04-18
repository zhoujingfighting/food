
const express = require('express')
const dbPromise = require('./db')
const multer = require('multer')
//multer上传图片用
const md5 = require('md5')
const path = require('path')
// const { io } = require('socket.io-client')
// 
var deskMap = new Map()
ioServer.on('connection' , socket => {
    // console.log('frefr')
    console.log(socket.handshake.url)
    socket.on('join desk', desk => {
        socket.join( desk )
        console.log( desk )
        var cartFood = deskMap.get(desk)
        if(!cartFood){
            deskMap.set(desk,[])
        }
        socket.emit('cart food', cartFood || [])
    }) 
    //商户端joinio
    socket.on('join restaurant',restaurant => {
        socket.join( restaurant )
    })
    socket.on('new food', info => {
        //相同的菜合并起来
        var  foodArray = deskMap.get( info.desk )
        console.log(foodArray)
        //和foodcart中的一样 ,那边订完单3
        var idx = foodArray.findIndex( it => it.food.id === info.food.id)
            if(idx >= 0){
                if(info.amount === 0){
                    foodArray.splice(idx,1)
                }else{
                    foodArray[idx].amount = info.amount
                }
            }else{
                foodArray.push({
                   food:info.food ,
                   amount:info.amount
                })
            }
        ioServer.in(info.desk).emit('new food',info)
        //这个是为了保证这个桌子上的每个客人都是一样的消息
    })
    //用户加入的桌子 
/*
2021/4/18
未解决得问题 : 
已经删除得订单这边菜品还是显示
*/
    // socket.on('new food',info => {
    //     socket.emit('new food' , info)
    // })
})
var storage = multer.diskStorage({
    destination(req,file,cb){
        cb(null,'./uploader/')
    },
    filename(req,file,cb){
        cb(null , Date.now() + path.extname(file.originalname))//appding.jpg
    }
})
const uploader = multer({
    storage:storage
})
//上传图片用
let db
(async function(){
    db = await require('./db')
}())

const app = express.Router()
//获取桌面信息:餐厅名称,桌面名称
//landing页面请求并显示
//desinfo>rid = 5 & did = 8
/*

*/
app.get('/deskinfo' ,async(req,res,next) =>{

    var desk = await db.get('SELECT desks.id as did,users.id as uid,desks.name ,users.title FROM desks JOIN users ON desks.rid = users.id WHERE desks.id=?',req.query.did)
    //先确定是哪个餐厅,再确定是哪个桌子
    res.json( desk )
    //返回桌子信息
})

//菜单管理
//nemu/restaurant/25
app.get('/menu/restaurant/:rid' ,async (req,res,next) => {
    // id interger primary key ,
    // rid interger not null ,
    // name string not null ,
    // desc string not null ,
    // price intrerger not null,
    // img string,
    // category string ,
    // status string not null)
    var menu = await db.all(`
        SELECT * FROM foods WHERE rid = ? AND status = 'on'
    ` ,req.params.rid)
    res.json( menu )
    //开始测试 , 可以返回一个数组,前端提供界面管理菜品
})
//前端下单,应该定义请求数据的格式
// {
//     cumstomCount : 用户数量 ,
//     food:[{id,count},{},{}] ,

// }
app.post('/restaurant/:rid/desk/:did/order' ,async (req,res,next) => {
    //用户下单
    var rid = req.params.rid
    var did = req.params.did 
    var totalPrice  = req.body.totalprice
    var deskName = req.body.deskname
    var customCount = req.body.customcount
    var details = JSON.stringify(req.body.foods)

    var status = 'PENDING'//'confirmed' ''
    var timestamp = new Date().toISOString()
     await db.run(`
        INSERT INTO orders (rid,did,deskName,totalprice,customCount,details,status,timestamp)
        VALUES(?,?,?,?,?,?,?,?)
    `,rid,did,deskName,totalPrice,customCount,details,status,timestamp)
    var order = await db.get('SELECT * FROM orders ORDER BY id DESC LIMIT 1')
    order.details = JSON.parse( order.details )
    //还得实时共享后台
     res.json( order)
     console.log(order)
    //  这里重启了服务器
    var desk = 'desk:' + did 
     deskMap.set( desk,[] )
     //存在服务器内存中
     ioServer.in(desk).emit('placeorder success',order)
     //只想发给当前桌
     ioServer.emit('new order' ,order)
})

//订单管理
app.route('/restaurant/:rid/order')
    .get( async (req,res,next) => {
        var orders = await db.all('SELECT * FROM orders WHERE rid=?' , req.cookies.userid)
        orders.forEach(order => {
            order.details = JSON.parse( order.details )
        })
        res.json( orders )
    })
app.route('/restaurant/:rid/order/:oid')
    .delete( async (req,res,next) => {
        var order = await db.run('SELECT * FROM orders WHERE rid=? AND id=?' , req.cookies.userid,req.params.oid)
        console.log(order)
        if(order){
            await db.run('DELETE FROM orders WHERE rid=? AND id=?' , req.cookies.userid,req.params.oid)
            delete  order.id
            res.json( order )
        }
        else{
            res.status(401).json({
                code:-1,
                msg:'你没有权限操作此订单'
            })
        }
    })
//更改订单状态
//POST:{status :'pending/confirmed/completed'}
app.route('/restaurant/:rid/order/:oid/status')
    .put(async(req,res,next) => {
        await db.run(`
        UPDATE orders SET status = ? WHERE id = ? and rid = ?
        ` , req.body.status ,req.params.oid ,req.cookies.userid)
        res.json(await db.get(`SELECT * FROM orders WHERE id=?`,req.params.oid))
    })
//菜品管理api
app.route('/restaurant/food')
 .get(async (req,res,next) => {
    //获取所有菜品列表用于页面展示
    // {//rid     cookie里面获得
    //     name ,
    //     img , 
    //     price,
    //     category,
    //     status : 'on'
    // }
    // console.log(req.params)
    var foods = await db.all(`
        SELECT * FROM foods WHERE rid = ?
    ` , req.cookies.userid)
    // console.log( foods )
    // 拿到所有菜品
    res.json( foods )
})
//input type='file' name='img
 .post(uploader.single('img'),async (req,res,next) => {
     //增加一个菜品DESC ,图片
     console.log(req.file)
     await db.run(`
        INSERT INTO foods (rid,name,price,desc,status,category,img) VALUES (?,?,?,?,?,?,?)
    `,req.cookies.userid,req.body.name,req.body.price,req.body.desc,req.body.status,req.body.category,req.file.filename)
    //最新插入的菜
    var food = await db.get('SELECT * FROM foods ORDER BY id DESC LIMIT 1')
    res.json( food )
 })
 
 app.route('/restaurant/:rid/food/:fid')
    .delete(async (req,res,next) => {
        var food = await db.get('SELECT * FROM foods WHERE id = ? AND rid=?',req.params.fid,req.cookies.userid)
        //删除一个菜品
            if(food){
                await db.run('DELETE FROM foods WHERE id = ? AND rid = ?',req.params.fid,req.cookies.userid)
                delete food.id
                res.json(food)
            }else{
                res.status(401).json({
                    code:'-1',
                    msg:"不存在此菜品或者你没有权限删除此菜品"
                })
            }
    })
    //也是需要修改图片的
    .put(uploader.single('img'), async (req,res,next) => {
        //修改菜品
        console.log(req.params)
        var fid = req.params.fid
        var userid = req.cookies.userid
        var food = await db.get('SELECT * FROM foods WHERE id = ? AND rid=?',req.params.fid,req.cookies.userid)

        console.log(req.file)
        //合并上来
        if(food){
            await db.run(`
                UPDATE foods SET name=?,price=?,status=?,desc=?,category=?,img=?
                WHERE id =? AND rid =?
                `,req.body.name,req.body.price,req.body.status,req.body.desc,req.body.category,req.file.filename,
                fid,userid
                )
            var food = await db.get('SELECT * FROM foods WHERE id = ? AND rid=?',req.params.fid,req.cookies.userid)
            res.json( food )
            console.log( food )
        }else{
            res.status(401).json({
                code:'-1',
                msg:"不存在此菜品或者你没有权限删除此菜品"
            })
        }
        
    })


app.route('/restaurant/:rid/desk')
    .get(async (req,res,next) => {
       //获取桌子列表
       var deskList = await db.get('SELECT * FROM desks WHERE rid=?', req.cookies.userid)
       res.json( deskList )
       // {//rid     cookie里面获得
       //     name ,
       //     img ,
       //     price,
       //     category,
       //     status : 'on'
       // }
   })
    .post(async (req,res,next) => {
        //增加一个桌子
        await db.run(`
           INSERT INTO desks (rid,name,capacity) VALUES (?,?,?)
       `,req.cookies.userid,req.body.name,req.body.capacity)
       //最新插入的菜
       var desk = await db.get('SELECT * FROM desks ORDER BY id DESC LIMIT 1')
       res.json( desk )
    })
    
//桌面管理api
app.route('/restaurant/:rid/desk/:did')//desk id
       .delete(async (req,res,next) => {
           var desk = await db.get('SELECT * FROM desks WHERE id = ? AND rid=?',req.params.did,req.cookies.userid)
           //删除一个桌子
               if(desk){
                   await db.run('DELETE FROM desks WHERE id = ? AND rid = ?',req.params.did,req.cookies.userid)
                   delete desk.id
                   res.json(desk)
               }else{
                   res.status(401).json({
                       code:'-1',
                       msg:"不存在此桌面或者你没有权限删除此桌面"
                   })
               }
       })
       .put( async (req,res,next) => {
           //修改菜品
           var did = req.params.did
           var userid = req.cookies.userid
           var food = await db.get('SELECT * FROM foods WHERE id = ? AND rid=?',did,userid)
           if(desk){
               await db.run(`
                   UPDATE desks SET name=?,capacity=?,
                   WHERE id =? AND rid =?
                   `,req.body.name,req.body.capacity,
                   did,userid
                   )
               var desk= await db.get('SELECT * FROM desks WHERE id = ? AND did=?',req.params.did,req.cookies.userid)
               res.json( desk )
           }else{
               res.status(401).json({
                   code:'-1',
                   msg:"不存在此桌面或者你没有权限删除此桌面"
               })
           }
           
       })
module.exports = app
    //导出中间件