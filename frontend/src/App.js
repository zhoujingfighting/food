// import logo from './logo.svg';
import './App.css';
import {HashRouter ,Route ,Switch} from 'react-router-dom'
//先把路由写好
// 扫码进入的页面 : /landing/restaurant/35/desk/20
// 点餐页面 : /restaurant/35/desk/20
// 点餐成功的页面
//    
// 餐厅侧 
//  登录
// 订单管理   /manage/order
// 订单详情页面:  /manage/order/35
// 菜品管理   /manage/food
// 桌面管理   /manage/desk
// 
import LandingPage from './LandingPage'
import FoodCart from './FoodCart'
import RestaurantManage from './RestaurantManage'
import Login from './Login'
import HomePage from './HomePage'
import Register from './Register'
import Orderscuccess from './Ordersuccess'
function App() {
  return (
    <HashRouter>
      <Switch>
        <Route path='/' exact component={HomePage}></Route>
        <Route path="/landing/r/:rid/d/:did" component={LandingPage}></Route>
        <Route path="/r/:rid/d/:did/c/:count" component={FoodCart}></Route>
        <Route path="/restaurant/:rid/manage" component = {RestaurantManage}></Route>
        <Route path="/login" component = {Login}></Route>
        <Route path="/register" component = {Register}></Route>
        <Route path = "/restaurant/:rid/desk/:did/order-success" component = {Orderscuccess}></Route>
      </Switch>
    </HashRouter>
  );
}  
export default App;
