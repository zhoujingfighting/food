"use strict";

var express = require('express');

var dbPromise = require('./db');

var multer = require('multer'); //multer上传图片用


var md5 = require('md5');

var path = require('path'); // const { io } = require('socket.io-client')
// 


var deskMap = new Map();
ioServer.on('connection', function (socket) {
  // console.log('frefr')
  console.log(socket.handshake.url);
  socket.on('join desk', function (desk) {
    socket.join(desk);
    console.log(desk);
    var cartFood = deskMap.get(desk);

    if (!cartFood) {
      deskMap.set(desk, []);
    }

    socket.emit('cart food', cartFood || []);
  }); //商户端joinio

  socket.on('join restaurant', function (restaurant) {
    socket.join(restaurant);
  });
  socket.on('new food', function (info) {
    //相同的菜合并起来
    var foodArray = deskMap.get(info.desk);
    console.log(foodArray); //和foodcart中的一样 ,那边订完单3

    var idx = foodArray.findIndex(function (it) {
      return it.food.id === info.food.id;
    });

    if (idx >= 0) {
      if (info.amount === 0) {
        foodArray.splice(idx, 1);
      } else {
        foodArray[idx].amount = info.amount;
      }
    } else {
      foodArray.push({
        food: info.food,
        amount: info.amount
      });
    }

    ioServer["in"](info.desk).emit('new food', info); //这个是为了保证这个桌子上的每个客人都是一样的消息
  }); //用户加入的桌子 

  /*
  2021/4/18
  未解决得问题 : 
  已经删除得订单这边菜品还是显示
  */
  // socket.on('new food',info => {
  //     socket.emit('new food' , info)
  // })
});
var storage = multer.diskStorage({
  destination: function destination(req, file, cb) {
    cb(null, './uploader/');
  },
  filename: function filename(req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); //appding.jpg
  }
});
var uploader = multer({
  storage: storage
}); //上传图片用

var db;

(function _callee() {
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return regeneratorRuntime.awrap(require('./db'));

        case 2:
          db = _context.sent;

        case 3:
        case "end":
          return _context.stop();
      }
    }
  });
})();

var app = express.Router(); //获取桌面信息:餐厅名称,桌面名称
//landing页面请求并显示
//desinfo>rid = 5 & did = 8

/*

*/

app.get('/deskinfo', function _callee2(req, res, next) {
  var desk;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return regeneratorRuntime.awrap(db.get('SELECT desks.id as did,users.id as uid,desks.name ,users.title FROM desks JOIN users ON desks.rid = users.id WHERE desks.id=?', req.query.did));

        case 2:
          desk = _context2.sent;
          //先确定是哪个餐厅,再确定是哪个桌子
          res.json(desk); //返回桌子信息

        case 4:
        case "end":
          return _context2.stop();
      }
    }
  });
}); //菜单管理
//nemu/restaurant/25

app.get('/menu/restaurant/:rid', function _callee3(req, res, next) {
  var menu;
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.next = 2;
          return regeneratorRuntime.awrap(db.all("\n        SELECT * FROM foods WHERE rid = ? AND status = 'on'\n    ", req.params.rid));

        case 2:
          menu = _context3.sent;
          res.json(menu); //开始测试 , 可以返回一个数组,前端提供界面管理菜品

        case 4:
        case "end":
          return _context3.stop();
      }
    }
  });
}); //前端下单,应该定义请求数据的格式
// {
//     cumstomCount : 用户数量 ,
//     food:[{id,count},{},{}] ,
// }

app.post('/restaurant/:rid/desk/:did/order', function _callee4(req, res, next) {
  var rid, did, totalPrice, deskName, customCount, details, status, timestamp, order, desk;
  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          //用户下单
          rid = req.params.rid;
          did = req.params.did;
          totalPrice = req.body.totalprice;
          deskName = req.body.deskname;
          customCount = req.body.customcount;
          details = JSON.stringify(req.body.foods);
          status = 'PENDING'; //'confirmed' ''

          timestamp = new Date().toISOString();
          _context4.next = 10;
          return regeneratorRuntime.awrap(db.run("\n        INSERT INTO orders (rid,did,deskName,totalprice,customCount,details,status,timestamp)\n        VALUES(?,?,?,?,?,?,?,?)\n    ", rid, did, deskName, totalPrice, customCount, details, status, timestamp));

        case 10:
          _context4.next = 12;
          return regeneratorRuntime.awrap(db.get('SELECT * FROM orders ORDER BY id DESC LIMIT 1'));

        case 12:
          order = _context4.sent;
          order.details = JSON.parse(order.details); //还得实时共享后台

          res.json(order);
          console.log(order); //  这里重启了服务器

          desk = 'desk:' + did;
          deskMap.set(desk, []); //存在服务器内存中

          ioServer["in"](desk).emit('placeorder success', order); //只想发给当前桌

          ioServer.emit('new order', order);

        case 20:
        case "end":
          return _context4.stop();
      }
    }
  });
}); //订单管理

app.route('/restaurant/:rid/order').get(function _callee5(req, res, next) {
  var orders;
  return regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.next = 2;
          return regeneratorRuntime.awrap(db.all('SELECT * FROM orders WHERE rid=?', req.cookies.userid));

        case 2:
          orders = _context5.sent;
          orders.forEach(function (order) {
            order.details = JSON.parse(order.details);
          });
          res.json(orders);

        case 5:
        case "end":
          return _context5.stop();
      }
    }
  });
});
app.route('/restaurant/:rid/order/:oid')["delete"](function _callee6(req, res, next) {
  var order;
  return regeneratorRuntime.async(function _callee6$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          _context6.next = 2;
          return regeneratorRuntime.awrap(db.run('SELECT * FROM orders WHERE rid=? AND id=?', req.cookies.userid, req.params.oid));

        case 2:
          order = _context6.sent;
          console.log(order);

          if (!order) {
            _context6.next = 11;
            break;
          }

          _context6.next = 7;
          return regeneratorRuntime.awrap(db.run('DELETE FROM orders WHERE rid=? AND id=?', req.cookies.userid, req.params.oid));

        case 7:
          delete order.id;
          res.json(order);
          _context6.next = 12;
          break;

        case 11:
          res.status(401).json({
            code: -1,
            msg: '你没有权限操作此订单'
          });

        case 12:
        case "end":
          return _context6.stop();
      }
    }
  });
}); //更改订单状态
//POST:{status :'pending/confirmed/completed'}

app.route('/restaurant/:rid/order/:oid/status').put(function _callee7(req, res, next) {
  return regeneratorRuntime.async(function _callee7$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          _context7.next = 2;
          return regeneratorRuntime.awrap(db.run("\n        UPDATE orders SET status = ? WHERE id = ? and rid = ?\n        ", req.body.status, req.params.oid, req.cookies.userid));

        case 2:
          _context7.t0 = res;
          _context7.next = 5;
          return regeneratorRuntime.awrap(db.get("SELECT * FROM orders WHERE id=?", req.params.oid));

        case 5:
          _context7.t1 = _context7.sent;

          _context7.t0.json.call(_context7.t0, _context7.t1);

        case 7:
        case "end":
          return _context7.stop();
      }
    }
  });
}); //菜品管理api

app.route('/restaurant/food').get(function _callee8(req, res, next) {
  var foods;
  return regeneratorRuntime.async(function _callee8$(_context8) {
    while (1) {
      switch (_context8.prev = _context8.next) {
        case 0:
          _context8.next = 2;
          return regeneratorRuntime.awrap(db.all("\n        SELECT * FROM foods WHERE rid = ?\n    ", req.cookies.userid));

        case 2:
          foods = _context8.sent;
          // console.log( foods )
          // 拿到所有菜品
          res.json(foods);

        case 4:
        case "end":
          return _context8.stop();
      }
    }
  });
}) //input type='file' name='img
.post(uploader.single('img'), function _callee9(req, res, next) {
  var food;
  return regeneratorRuntime.async(function _callee9$(_context9) {
    while (1) {
      switch (_context9.prev = _context9.next) {
        case 0:
          //增加一个菜品DESC ,图片
          console.log(req.file);
          _context9.next = 3;
          return regeneratorRuntime.awrap(db.run("\n        INSERT INTO foods (rid,name,price,desc,status,category,img) VALUES (?,?,?,?,?,?,?)\n    ", req.cookies.userid, req.body.name, req.body.price, req.body.desc, req.body.status, req.body.category, req.file.filename));

        case 3:
          _context9.next = 5;
          return regeneratorRuntime.awrap(db.get('SELECT * FROM foods ORDER BY id DESC LIMIT 1'));

        case 5:
          food = _context9.sent;
          res.json(food);

        case 7:
        case "end":
          return _context9.stop();
      }
    }
  });
});
app.route('/restaurant/:rid/food/:fid')["delete"](function _callee10(req, res, next) {
  var food;
  return regeneratorRuntime.async(function _callee10$(_context10) {
    while (1) {
      switch (_context10.prev = _context10.next) {
        case 0:
          _context10.next = 2;
          return regeneratorRuntime.awrap(db.get('SELECT * FROM foods WHERE id = ? AND rid=?', req.params.fid, req.cookies.userid));

        case 2:
          food = _context10.sent;

          if (!food) {
            _context10.next = 10;
            break;
          }

          _context10.next = 6;
          return regeneratorRuntime.awrap(db.run('DELETE FROM foods WHERE id = ? AND rid = ?', req.params.fid, req.cookies.userid));

        case 6:
          delete food.id;
          res.json(food);
          _context10.next = 11;
          break;

        case 10:
          res.status(401).json({
            code: '-1',
            msg: "不存在此菜品或者你没有权限删除此菜品"
          });

        case 11:
        case "end":
          return _context10.stop();
      }
    }
  });
}) //也是需要修改图片的
.put(uploader.single('img'), function _callee11(req, res, next) {
  var fid, userid, food;
  return regeneratorRuntime.async(function _callee11$(_context11) {
    while (1) {
      switch (_context11.prev = _context11.next) {
        case 0:
          //修改菜品
          console.log(req.params);
          fid = req.params.fid;
          userid = req.cookies.userid;
          _context11.next = 5;
          return regeneratorRuntime.awrap(db.get('SELECT * FROM foods WHERE id = ? AND rid=?', req.params.fid, req.cookies.userid));

        case 5:
          food = _context11.sent;
          console.log(req.file); //合并上来

          if (!food) {
            _context11.next = 17;
            break;
          }

          _context11.next = 10;
          return regeneratorRuntime.awrap(db.run("\n                UPDATE foods SET name=?,price=?,status=?,desc=?,category=?,img=?\n                WHERE id =? AND rid =?\n                ", req.body.name, req.body.price, req.body.status, req.body.desc, req.body.category, req.file.filename, fid, userid));

        case 10:
          _context11.next = 12;
          return regeneratorRuntime.awrap(db.get('SELECT * FROM foods WHERE id = ? AND rid=?', req.params.fid, req.cookies.userid));

        case 12:
          food = _context11.sent;
          res.json(food);
          console.log(food);
          _context11.next = 18;
          break;

        case 17:
          res.status(401).json({
            code: '-1',
            msg: "不存在此菜品或者你没有权限删除此菜品"
          });

        case 18:
        case "end":
          return _context11.stop();
      }
    }
  });
});
app.route('/restaurant/:rid/desk').get(function _callee12(req, res, next) {
  var deskList;
  return regeneratorRuntime.async(function _callee12$(_context12) {
    while (1) {
      switch (_context12.prev = _context12.next) {
        case 0:
          _context12.next = 2;
          return regeneratorRuntime.awrap(db.get('SELECT * FROM desks WHERE rid=?', req.cookies.userid));

        case 2:
          deskList = _context12.sent;
          res.json(deskList); // {//rid     cookie里面获得
          //     name ,
          //     img ,
          //     price,
          //     category,
          //     status : 'on'
          // }

        case 4:
        case "end":
          return _context12.stop();
      }
    }
  });
}).post(function _callee13(req, res, next) {
  var desk;
  return regeneratorRuntime.async(function _callee13$(_context13) {
    while (1) {
      switch (_context13.prev = _context13.next) {
        case 0:
          _context13.next = 2;
          return regeneratorRuntime.awrap(db.run("\n           INSERT INTO desks (rid,name,capacity) VALUES (?,?,?)\n       ", req.cookies.userid, req.body.name, req.body.capacity));

        case 2:
          _context13.next = 4;
          return regeneratorRuntime.awrap(db.get('SELECT * FROM desks ORDER BY id DESC LIMIT 1'));

        case 4:
          desk = _context13.sent;
          res.json(desk);

        case 6:
        case "end":
          return _context13.stop();
      }
    }
  });
}); //桌面管理api

app.route('/restaurant/:rid/desk/:did') //desk id
["delete"](function _callee14(req, res, next) {
  var desk;
  return regeneratorRuntime.async(function _callee14$(_context14) {
    while (1) {
      switch (_context14.prev = _context14.next) {
        case 0:
          _context14.next = 2;
          return regeneratorRuntime.awrap(db.get('SELECT * FROM desks WHERE id = ? AND rid=?', req.params.did, req.cookies.userid));

        case 2:
          desk = _context14.sent;

          if (!desk) {
            _context14.next = 10;
            break;
          }

          _context14.next = 6;
          return regeneratorRuntime.awrap(db.run('DELETE FROM desks WHERE id = ? AND rid = ?', req.params.did, req.cookies.userid));

        case 6:
          delete desk.id;
          res.json(desk);
          _context14.next = 11;
          break;

        case 10:
          res.status(401).json({
            code: '-1',
            msg: "不存在此桌面或者你没有权限删除此桌面"
          });

        case 11:
        case "end":
          return _context14.stop();
      }
    }
  });
}).put(function _callee15(req, res, next) {
  var did, userid, food, desk;
  return regeneratorRuntime.async(function _callee15$(_context15) {
    while (1) {
      switch (_context15.prev = _context15.next) {
        case 0:
          //修改菜品
          did = req.params.did;
          userid = req.cookies.userid;
          _context15.next = 4;
          return regeneratorRuntime.awrap(db.get('SELECT * FROM foods WHERE id = ? AND rid=?', did, userid));

        case 4:
          food = _context15.sent;

          if (!desk) {
            _context15.next = 14;
            break;
          }

          _context15.next = 8;
          return regeneratorRuntime.awrap(db.run("\n                   UPDATE desks SET name=?,capacity=?,\n                   WHERE id =? AND rid =?\n                   ", req.body.name, req.body.capacity, did, userid));

        case 8:
          _context15.next = 10;
          return regeneratorRuntime.awrap(db.get('SELECT * FROM desks WHERE id = ? AND did=?', req.params.did, req.cookies.userid));

        case 10:
          desk = _context15.sent;
          res.json(desk);
          _context15.next = 15;
          break;

        case 14:
          res.status(401).json({
            code: '-1',
            msg: "不存在此桌面或者你没有权限删除此桌面"
          });

        case 15:
        case "end":
          return _context15.stop();
      }
    }
  });
});
module.exports = app; //导出中间件