import React, { useState } from 'react'
import { withRouter } from 'react-router'
import api from './api'
export default withRouter(function AddFood(props){
    //受控组件
    var [foodInfo ,setFoodInfo] = useState({
        name : '' ,
        desc:'' ,
        price : '' ,
        category :'',
        status:'on'
    })
    function change(e){
        setFoodInfo({
            ...foodInfo,
            [e.target.name] : e.target.value
        })
    }
    function submit(e){
        e.preventDefault()
        api.post('/restaurant/food',foodInfo).then(res => {
         props.history.goBack()
        })
    }
    return (
        <div>
            <h2>添加菜品</h2>
            <form onSubmit={submit}>
                名称:<input type='text' onChange={change} defaultValue={foodInfo.name} name='name'></input>
                描述:<input type='text' onChange={change} defaultValue={foodInfo.desc} name='desc'></input>
                价格:<input type='text' onChange={change} defaultValue={foodInfo.price} name='price'></input>
                分类:<input type='text' onChange={change} defaultValue={foodInfo.category} name='category'></input>
                <button>提交添加菜品</button>
            </form>
        </div>
    )
})