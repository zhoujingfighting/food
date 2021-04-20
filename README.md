项目思维导图连接地址 : 链接：https://gitmind.cn/app/doc/2071528469  密码：1618
### 项目运行
- 如果路由跳转出现BUG,应该是写完项目有些默认路由跳转没有更新,直接修改对应路由就好
- cd backend , 然后运行npm install安装依赖 , nodemon app.js开启后端服务器 , 有可能会有报错 , 提示数据库没有totalprice字段 , 可以自行更新字段(interger类型) ,其他bug暂时没有发现.数据库用的sqlite
- cd frontend , 然后运行npm install安装依赖 , npm run start运行React app
	- 默认页面是餐厅管理员登陆页面 , 先注册在登陆 , 登录之后可以自行管理菜品
	- 顾客登陆页面在http://localhost:3000/#/landing/r/1/d/1,这个可以自行修改,前提是有这个resraurant

### 需求分析

1 : 用户无需登录

2 : 实时同步功能

3 : 厨房实时收到订单(核心功能)

- 用户侧 : 

二维码的地址: 

/landing/restaurant/25/desk/8

页面显示的内容

餐厅名称 , 桌号,人数选择 ,开始点餐按钮

- 点餐页面

/restaurant/25/desk/8?customs = 3

显示菜单,购物车,实时同步

获取菜单

/api/menus?restaurantId=25



websocket : 

​	自己点的菜发往服务器

​	接受其他人点的菜

​	服务端要存储当前桌面已经点的所有的菜

​	

下单 : 

post   /api/placeholder

```javas
post   /api/placeholder
{
deskId ,restaurantId
	
}
```

商户侧

登陆注册,

创建餐厅

订单管理 

订单信息

​	桌面id ,餐厅id,人数,菜品列表,菜品分类

菜品信息

名称,描述,价格,图片url,id,restaurantId,上架状态

菜品管理 :

获取菜品,get /reataurant/3/food

删除菜品,delete restaurant/3/food/5

增加菜品,post /restaurant/3/food

修改菜品(增删改查) put restaurant/3/food/5

桌面管理

桌面信息:

​	桌面名称,容纳人数,id,restaurant





### 数据库设计

restaurant

id name password title

foods

id rid name desc price img status categroy status(0n/off)

desks

id rid name capacity

orders

id rid did customs details({id,count,name},{},{}) status(complted)

