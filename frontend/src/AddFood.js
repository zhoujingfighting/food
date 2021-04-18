import React, { useState } from 'react'
import { withRouter } from 'react-router'
import api from './api'
import './css/add-food.css'
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
    function imgChange(e){
        setFoodInfo({ 
            ...foodInfo,
            img : e.target.files[0]
        })
    }
    function submit(e){
        e.preventDefault()
        var fd = new FormData()
        for(var key in foodInfo){
            var val = foodInfo[key]
            fd.append(key,val)
        }
        //这里要把foodInfo变成fd,因为添加了img文件
        api.post('/restaurant/food',fd).then(res => {
        props.history.goBack()
        })
    }
    return (
        <div>
            <div className='addfood-title'>
                <h2 >添加菜品</h2>
            </div>
            <form onSubmit={submit}>
            <div className='addfood_wrap'>
                <div className='food_wrap'> 
                    名称&nbsp;&nbsp;:&nbsp;&nbsp;<input type='text' onChange={change} defaultValue={foodInfo.name} name='name'></input>
                </div >
                <div className='food_wrap'>
                    描述&nbsp;&nbsp;:&nbsp;&nbsp;<input type='text' onChange={change} defaultValue={foodInfo.desc} name='desc'></input>
                </div>    
                <div className='food_wrap'>
                     价格&nbsp;&nbsp;:&nbsp;&nbsp;<input type='text' onChange={change} defaultValue={foodInfo.price} name='price'></input>
                </div>
                <div className='food_wrap'> 
                    分类&nbsp;&nbsp;:&nbsp;&nbsp;<input type='text' onChange={change} defaultValue={foodInfo.category} name='category'></input>
                </div>
               <div className='food_wrap'>
                     选择图片&nbsp;&nbsp;&nbsp;&nbsp;<input type='file' onChange={imgChange} name='img'></input>
                </div>
                <div className='food_wrap'>
                    <button>提交添加菜品</button>
                </div>
            </div>
            </form>
        </div>
    )
})