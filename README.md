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

