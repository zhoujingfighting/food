
import React, { Component, useCallback, useEffect, useState } from 'react'
import io from 'socket.io-client'
import api from './api'
import produce from 'immer'
import './css/ordermanage.css'
//这个
//只运行一次的就放在useEffect
function OrderItem({order,onDelete}) {
    // 这个是触发父组件的ondelete 
    var [orderInfo,setOrder] = useState(order)
    // console.log( 'e3234324',props)
    function setConfirm(){
        api.put(`/restaurant/${orderInfo.rid}/order/${orderInfo.id}/status`,{
            status : 'Confirmed'
        }).then(() => {
            setOrder({
                 ...orderInfo,
                 status:'Confirmed'
                //  也可以ajax少一点请求
            })
        })
    }
    function setComplete(){
        api.put(`/restaurant/9/order/${orderInfo.id}/status` , {
            status : 'Completed'
        }).then(() => {
            setOrder({
                 ...orderInfo,
                 status:'Completed '
                //  也可以ajax少一点请求
            })
        })
    }
    function deleteOrder(){
        api.delete(`/restaurant/9/order/${orderInfo.id}`).then( () =>{
            onDelete(orderInfo)
        })
        // 更新状态

    }
    return (
        <div className='order-itemwrap'>
            <h2 className='order-title'>{orderInfo.deskname}</h2>
            <h3>总价格 : {orderInfo.totalPrice}</h3>
            <h3>总人数 : {orderInfo.customCount}</h3>
            <h3>订单状态 : {orderInfo.status}</h3>
            <div></div>
            <div className='order-buttonwrap'>
                <button>打印</button>
                <button onClick={setConfirm}>确认</button>
                <button onClick={setComplete}>完成</button>
                <button onClick={deleteOrder}>删除</button>
                {/* 确认完成后,订单应该没有 */}
            </div>
        </div>
    )
}
    

export default class OrderManage extends Component{
    constructor(props){
        super(props)
        this.state = {
            orders : []
        }
        this.order = this.order.bind( this )
    }
    componentDidMount(){
        console.log(this.props)
        this.socket = io('http://localhost:5000',{
            //正确的做法是根据http连接的时候带的usercookie来选择哪个餐厅与房间
            withCredentials: true,
            transportOptions: {
              polling: {
                extraHeaders: {
                  "my-custom-header": "abcd"
                }
              }
            }
        })
        this.socket.on('connect',()=>{
            this.socket.emit('join restaurant',"restaurant:" + this.props.match.rid)
        })
        this.socket.on('new order' , order => {
            console.log(order)
            this.setState(state => ({
                orders : [order,...state.orders]
                //需要知道接收哪一家的订单
            }))
        })
        api.get('/restaurant/9/order').then(res => {
            this.setState({
                orders:res.data
            })
    })}
   componentWillUnmount(){
        this.socket.close()
    }
    order = (order)=>{
        var idx = this.state.orders.findIndex(it => it.id === order.id)
        this.setState(produce(this.state, state => {
            state.orders.splice(idx,1)
        }))
        //这个是删除订单
    }
    render(){
        return (
            <div>
                <div>
                    {/* 这里是商户登录页面tab菜单的第一项
                    1 > 收到订单
                    2 > 实时显示订单
                    */}
                </div>
                <div>
                    {
                        this.state.orders.length > 0 ?
                        this.state.orders.map( it => {
                            return < OrderItem  order = {it} key={it.id} onDelete={this.order}/>
                        }):
                        <div>loading...</div>
                    }
                </div>  
            </div>
        )
    }
}
/*


    // var [orders,setOrders] = useState([])
    // //这个是要变化的
    // //mei一个订单就是一个组件
    // useEffect( () => {
    //     // 这里的1是暂时的
    //     api.get('/restaurant/9/order').then(res => {
    //         setOrders(res.data)
    //         console.log( orders )
    //     })
    // },[])
    // //为什么用useEffect因为只想它运行一次
    //  newOrder = useCallback(function order(){
    //      setOrders([
    //             ...orders,
    //             order
    //         ])
    // },[orders])
    // //useCallback
    // useEffect( () => {
    //     var socket = io()
    //     socket.on('new order' , newOrder)
    //     return () => {
    //         socket.close()
    //     }
    // } , [orders])

*/