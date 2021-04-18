import React, { Suspense, useMemo} from 'react'
import { Route, Switch, withRouter } from 'react-router-dom'
import OrderManage from './OrderManage'
import FoodManage from './FoodManage'
import DeskManage from './DeskManage'
import AddFood from './AddFood'
import api from './api'
import createFetcher from './fetcher'
// import _ from 'lodash'
import { Tabs } from 'antd';
import './css/resmanage.css'
const { TabPane } = Tabs;    
// fetcher用法 ,请求不要到数据应该怎么办
export default withRouter(function RestaurantManage(props){
    console.log(props)
    var params = props.match.params
    var rid = params.rid
//从后端拿到餐厅信息
    // async function logout(){
    //     await api.get('/logout')
    //     // //登出之后
    //     props.history.push('/')
    // }
    //这个请求只用请求一次
    console.log(props)
    let RestaurantInfo = useMemo(() => {
        var userInfoFetcher = createFetcher(() => {
            return api.get('/userinfo')
        })
        return function RestaurantInfo(){ 
            var info = userInfoFetcher.read() 
            return (
                <div className='welcome'>
                   <h2 className='res-h2'><span className='res-span'>欢迎{info.data.title}登录</span> </h2> 
                </div>
            )
        }
    }, [])   
    // var userInfoFetcher = createFetcher(() => {
    //         return api.get('/userinfo')
    //     })    
    // var info = userInfoFetcher.read() 
    // var RestaurantInfo = null
    // useEffect(() => {
    //     RestaurantInfo =  function RestaurantInfo(){ 
    //         return (
    //             <div className='welcome'>
    //                <h2 className='res-h2'><span className='res-span'>欢迎{info.data.title}登录</span> </h2> 
    //             </div>
    //         )
    //     }
    // },[])
    async function handleEvents(e){
        switch(e){
            case '1':
                props.history.push(`/restaurant/${rid}/manage/order`)
                break;
            case '2' :
                props.history.push(`/restaurant/${rid}/manage/food`)
                break
            case '3' : 
                props.history.push(`/restaurant/${rid}/manage/desk`)
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
            <nav className='res-nav'>
                {/* 导航栏 */}
                <Tabs  onChange={handleEvents}>
                     <TabPane tab="订单管理" key="1" >
                     </TabPane>
                     <TabPane tab="菜品管理" key="2" >
                     </TabPane>
                     <TabPane tab="桌面管理" key="3">
                     </TabPane>
                     <TabPane tab="退出登录" key="4">
                     </TabPane>
                </Tabs>
            </nav>
            <main>
                <Switch>
                    <Route path="/restaurant/:rid/manage/order" component={ OrderManage } ></Route>
                    <Route path='/restaurant/:rid/manage/food'  component={ FoodManage } ></Route>
                    <Route path='/restaurant/:rid/manage/desk'  component={ DeskManage } ></Route>
                    <Route path='/restaurant/:rid/manage/add-food'  component={ AddFood } ></Route>
                </Switch>
            </main>
        </div>
    )
})