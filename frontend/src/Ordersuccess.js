import React from 'react'

export default function Orderscuccess(props){
    //这个是从上面接下来的参数
    console.log(props)
    return (
        <div>
            <h2>下单成功</h2>
            <p>总价:{props.location.state.totalPrice}</p>
            {/* 商户这里到这个时候应该显示实时订单 */}
        </div>
    )
}