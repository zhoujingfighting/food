import React, { Component,useState } from 'react'
import propTypes from 'prop-types';
import api from './api'
import {produce} from 'immer'
import './css/foodcart.css'
import io from 'socket.io-client'
function MenuItem({food,onUpdate,amount}){//展出菜单条目
    //强行传属性,这里不规定属性值,会有报错
    //这个菜的数字也得有变化 
    // var [count,setCount] = useState(amount)
    console.log('efdef')
    function add(){
        // setCount( count + 1)
        //什么菜,数量是多少
        onUpdate(food,amount + 1)
        //此时这个还没变
    }
    function dec(){
        if(amount === 0){
            return
        }
        // setCount(count - 1)
        onUpdate(food,amount - 1)
        //道理同上
    }
    return(
        <div className='cart-menu'>
            <h3 className='menu-title'>{ '菜名 : ' + food.name }</h3>
            <div className='cartmenu-imgwrap'>
                <img src={'http://localhost:5000/uploader/' + food.img} alt={food.name}></img>
                <div className='food-info'>
                    <p>{'顾客评价 : ' + food.desc}</p>
                    <p>{'菜肴价格 : '+ food.price}</p>
                </div>
            </div>
            <div className='cart-design'>
                <button onClick={add}>+</button>
                <span>{amount}</span>
                <button onClick={dec}>-</button>
            </div>
        </div>
        ) 
}
MenuItem.propTypes = {
    food:propTypes.object.isRequired,
    onUpdate:propTypes.func,
}
//这里遇到了一个bug,官方文档上的PropTypes => propTypes
MenuItem.defaultProps = {
    onUpdate : () => {}
}
function  calCartprice(cartArray){
    return cartArray.reduce((total,item) => {
        return total + item.amount * item.food.price
    } ,0)
}
function CartStatus(props){
    console.log( props )
    var [expend,setExpend] = useState(false)
    var totalPrice = calCartprice(props.foods)
    return (
        <div className='cart-car'>
            {expend ? 
            <button onClick={()=>{setExpend(false)}}>展开</button>
            :
            <button onClick={()=>{setExpend(true)}}>收起</button>
            }
            <strong>总价:{totalPrice}</strong>
            <button onClick={ ()=>{ props.OnPlaceOrder()} }>下单</button>
        </div>
    )
}
// function Push(url,data){
//     var history = useHistory()
//     history.push({
//         pathname:url,
//         state:data
//     })
// }
export default class Foodcart extends Component{
    constructor(props){
        console.log(props)
        super(props)
        this.state = {
            props : props,
            cart : [],
            //购物车
            deskInfo:{},
            foodMenu:[]
            // 类组件不能用hooks
        }
    }
    componentDidMount(){   
        var params = this.props.match.params
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
        console.log( this.socket )
        //加入哪个号桌子,立马触发加入哪个桌子
        this.socket.on('connect' , () => {
            console.log('connection on')
            this.socket.emit('join desk' ,'desk:'+ params.did)
        })
       

        api.get('/deskinfo?did=' + params.did).then( val => {
            this.setState({
                deskInfo : val.data
            })
        })
        api.get(`/menu/restaurant/${params.rid}`).then( (res) => {
            this.setState({
                foodMenu : res.data
            })
            console.log( this.state.foodMenu)
        })
        //拿到总菜单,就
      
        //后端返回此桌面已点菜单
        this.socket.on('cart food' , info => {
            console.log(info)
            this.setState(produce(state => {
                state.cart.push(...info)
                //需要知道接收哪一家的订单
            }))
        })
        //后端返回同桌其他用户新增的菜单
        //新菜单要覆盖掉原来菜单
        //同时扫码点餐,每一个人都有一个页面
        this.socket.on('new food' , info => {
            console.log(info)
            this.foodChange(info.food,info.amount)
            //同步过后购物车消息就到这里
        })
        this.socket.on('placeorder success',(order)=>{
            this.props.history.push({
                pathname : `/restaurant/${params.rid}/desk/${params.did}/order-success`,
                state : order
            })
        })
    }
    //同桌其他人同时点菜,socket实现同步功能 2021-4-16
    cartChange = (food,amount) => {
        //告知具体的桌面是哪一个
        var params = this.props.match.params
        this.socket.emit('new food',{ desk : 'desk:' + params.did , food , amount})
    }
    foodChange = ( food,amount ) => {
        //改变购物车的状态
        var updated = produce(this.state.cart ,cart => {
            var idx = cart.findIndex( it => it.food.id === food.id)
            if(idx >= 0){
                if(amount === 0){
                    cart.splice(idx,1)
                }else{
                    cart[idx].amount = amount
                }
            }else{
                cart.push({
                   food ,
                   amount
                })
            }
        })
        // [ {id,amongt} ]
        this.setState({
            cart:updated
        })
    }
    placeOrder = () => {
        var params = this.props.match.params
        api.post(`/restaurant/${params.rid}/desk/${params.did}/order` ,{
            deskname : this.state.deskInfo.name,
            customcount : params.count,
            totalprice: calCartprice(this.state.cart),
            foods : this.state.cart,
        }).then( (res) => {
            console.log( res )
            // this.setState({
            //     cart:[]
            // })
            //下完单过后购物车应该清空
            this.socket.emit('order end')
            this.props.history.push({
                pathname : `/restaurant/${params.rid}/desk/${params.did}/order-success`,
                state :  res.data 
            })
                //将数据传下去
          
            // push(`/restaurant/${params.rid}/desk/${params.did}/order-success`,res.data)
        })
    }
    componentWillUnmount(){
        this.socket.close()
    }
    render(){
        return (
            <div className='cart'>
                <div className='cart-wrap'>
                    {
                        this.state.foodMenu.map( food => {
                           var currentAmount = 0
                           var currFoodCartItem = this.state.cart.find(it => it.food.id === food.id)
                           if(currFoodCartItem){
                               currentAmount = currFoodCartItem.amount
                           }
                           return <MenuItem food={ food } amount={currentAmount} onUpdate={ this.cartChange }/>
                        })
                        // z这个页面的参数传到下一个页面
                        //amount是发送到服务器上的,不受客户端控制
                    }
                </div>
                <CartStatus foods = { this.state.cart } OnPlaceOrder={this.placeOrder} onUpdate={ this.cartChange } /> 
            </div>
            )
    }
//点餐,提交订单
    //把菜的数量存起来cart
// 购物车的实现是个麻烦事儿
/*
foods:购物车信息
onUpdate事件是用户修改菜品数量时触发
onplaceOrder事件 : 用户点击下单时触发
*/
}
