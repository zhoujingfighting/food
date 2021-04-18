"use strict";

var fs = require('fs');

var multer = require('multer');

var md5 = require('md5');

var express = require('express');

var sharp = require('sharp');

var svgCaptcha = require('svg-captcha');

var fsp = fs.promises;
var uploader = multer({
  dest: './uploader/',
  preservePath: true
});
var db; // const dbPromise = require('./db')
// dbPromise.then(dbObject => {
//     db = dbObject
// })

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

var changePasswordTokenMap = {};

var mailer = require('./mailer');

var app = express.Router();
app.route('/register').post(uploader.single('avatar'), function _callee2(req, res, next) {
  var regInfo, user, imgBuf;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          regInfo = req.body;
          console.log('register', regInfo);
          _context2.next = 4;
          return regeneratorRuntime.awrap(db.get('SELECT * FROM users where name=?', regInfo.name));

        case 4:
          user = _context2.sent;

          if (!user) {
            _context2.next = 12;
            break;
          }

          if (!req.file) {
            _context2.next = 9;
            break;
          }

          _context2.next = 9;
          return regeneratorRuntime.awrap(fsp.unlink(req.file.path));

        case 9:
          res.status(401).json({
            code: -1,
            msg: '用户名已被占用'
          });
          _context2.next = 21;
          break;

        case 12:
          if (!req.file) {
            _context2.next = 18;
            break;
          }

          _context2.next = 15;
          return regeneratorRuntime.awrap(fsp.readFile(req.file.path));

        case 15:
          imgBuf = _context2.sent;
          _context2.next = 18;
          return regeneratorRuntime.awrap(sharp(imgBuf).resize(256).toFile(req.file.path));

        case 18:
          _context2.next = 20;
          return regeneratorRuntime.awrap(db.run('INSERT INTO users (name,email,password,title) VALUES (?,?,?,?)', regInfo.name, regInfo.email, regInfo.password, regInfo.title));

        case 20:
          res.json({
            code: 0,
            msg: '注册成功'
          });

        case 21:
        case "end":
          return _context2.stop();
      }
    }
  });
});
app.get('/userinfo', function _callee3(req, res, next) {
  var userid;
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          userid = req.cookies.userid;
          console.log(req.cookies);

          if (!userid) {
            _context3.next = 10;
            break;
          }

          _context3.t0 = res;
          _context3.next = 6;
          return regeneratorRuntime.awrap(db.get('SELECT id,name,title FROM users WHERE id=?', userid));

        case 6:
          _context3.t1 = _context3.sent;

          _context3.t0.json.call(_context3.t0, _context3.t1);

          _context3.next = 11;
          break;

        case 10:
          res.status(404).json({
            code: -1,
            msg: '不存在此餐厅'
          });

        case 11:
        case "end":
          return _context3.stop();
      }
    }
  });
});
app.route('/login').post(function _callee4(req, res, next) {
  var tryLogin, user;
  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          tryLogin = req.body;
          _context4.next = 3;
          return regeneratorRuntime.awrap(db.get('SELECT id,name,title FROM users WHERE name=? AND password=?', tryLogin.name, tryLogin.password));

        case 3:
          user = _context4.sent;

          if (user) {
            res.cookie('userid', user.id); //不使用签名

            res.json({
              code: 0,
              msg: '登陆成功',
              id: user.id
            });
          } else {
            res.status(403).json({
              code: -1,
              msg: '用户名和密码错误'
            });
          }

        case 5:
        case "end":
          return _context4.stop();
      }
    }
  });
});
app.get('/logout', function (req, res, next) {
  res.clearCookie('userid');
  res.json({
    code: 0,
    msg: '登出成功'
  });
});
module.exports = app;