const express = require('express')
const dbPromise = require('./db')
let db
(async function(){
    db = await require('./db')
}())

const app = express.Router()
//获取桌面信息:餐厅名称,桌面名称
//landing页面请求并显示
//desinfo>rid = 5 & did = 8
app.get('/deskinfo' ,async(req,res,next) =>{
    var desk = await db.get('SELECT desks.id as did,users.id as uid,desks.name,users.title FROM desks JOIN users ON desks.rid = users.id WHERE desks.id=?',req.query.did)
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
    var deskName = req.body.deskName
    var customCount = req.body.customCount
    var details = JSON.stringify(req.body.foods)
    var status = 'PENDING'//'confirmed' ''
    var timestamp = new Date().toISOString()
     await db.run(`
        INSERT INTO orders (rid,did,deskName,customCount,details,status,timestamp)
        VALUES(?,?,?,?,?,?,?)
    `,rid,did,deskName,customCount,details,status,timestamp)
    var order = await db.get('SELECT * FROM orders ORDER BY id DESC LIMIT 1')
    //还得实时共享后台
    res.json( order )
})
//菜品管理api
app.route('/restaurant/:rid/food')
 .get(async (req,res,next) => {
    //获取所有菜品列表用于页面展示
    
    // {//rid     cookie里面获得
    //     name ,
    //     img ,
    //     price,
    //     category,
    //     status : 'on'
    // }
})
 .post(async (req,res,next) => {
     //增加一个菜品DESC
     await db.run(`
        INSERT INTO foods (rid,name,price,desc,status) VALUES (?,?,?,?,?)
    `,req.cookies.userid,req.body.name,req.body.price,req.body.desc,req.body.status)
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
    .put( async (req,res,next) => {
        //修改菜品
        var fid = req.params.fid
        var userid = req.cookies.userid
        var food = await db.get('SELECT * FROM foods WHERE id = ? AND rid=?',req.params.fid,req.cookies.userid)
        if(food){
            await db.run(`
                UPDATE foods SET name=?,price=?,status=?
                WHERE id =? AND rid =?
                `,req.body.name,req.body.price,req.body.status,
                fid,userid
                )
            var food = await db.get('SELECT * FROM foods WHERE id = ? AND rid=?',req.params.fid,req.cookies.userid)
            res.json( food )
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