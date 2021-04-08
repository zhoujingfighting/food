const sqlite = require('sqlite')
const sqlite3 = require('sqlite3')
//这是新修改的属性
const dbPromise = sqlite.open({
    filename : __dirname + '/db/restaurant.sqlite3' ,
    driver : sqlite3.Database
})
//
//同一个餐厅的登录,在同一个房间
module.exports = dbPromise