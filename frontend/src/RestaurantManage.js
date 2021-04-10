import React, { Suspense, useState } from 'react'
import { Route, Switch, withRouter } from 'react-router-dom'
import OrderManage from './OrderManage'
import FoodManage from './FoodManage'
import DeskManage from './DeskManage'
import api from './api'
import createFetcher from './fetcher'
import { Tabs } from 'antd';
import './css/resmanage.css'
const { TabPane } = Tabs;

// fetcher用法 ,请求不要到数据应该怎么办

export default withRouter(function RestaurantManage(props){
    // var [info,setInfo] = useState({})
   const userInfoFetcher = createFetcher( () => {
    return api.get('/userinfo')
})
//从后端拿到餐厅信息
    // async function logout(){
    //     await api.get('/logout')
    //     // //登出之后
    //     props.history.push('/')
    // }
    function RestaurantInfo(){ 
        var info = userInfoFetcher.read() 
        console.log(info)
        return (
            <div className='welcome'>
               <h2><span>欢迎{info.data.title}登录</span> </h2> 
            </div>
        )
    }
    async function handleEvents(e){
        switch(e){
            case '1':
                props.history.push('/manage/order')
                break;
            case '2' :
                props.history.push('/manage/food')
                break
            case '3' : 
                props.history.push('/manage/desk')
                break
            case '4' : 
                await api.get('/logout')
                props.history.push('/')
                break
            default:
        }
    }
    return (
        <div className='resmanage'>
            <Suspense fallback={ <div>loading....</div> }>
                <RestaurantInfo />
            </Suspense>
            <nav>
                {/* 导航栏 */}
                <ul>
                <Tabs defaultActiveKey="1" onChange={handleEvents}>
                     <TabPane tab="订单管理" key="1" >
                     </TabPane>
                     <TabPane tab="菜品管理" key="2" >
                     </TabPane>
                     <TabPane tab="桌面管理" key="3">
                     </TabPane>
                     <TabPane tab="退出登录" key="4">
                     </TabPane>
                </Tabs>
                </ul>
            </nav>
            <main>
                <Switch>
                    <Route path='/manage/order' component={ OrderManage } ></Route>
                    <Route path='/manage/food'  component={ FoodManage } ></Route>
                    <Route path='/manage/desk'  component={ DeskManage } ></Route>
                </Switch>
            </main>
        </div>
    )
})