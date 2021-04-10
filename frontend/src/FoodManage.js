import React, { useEffect, useState } from 'react'
import api from './api'
/*
    菜品管理页面应该是:左侧是选择品区,右侧是选择的菜区
*/
function FoodItem( {food} ){
    var [foodInfo,setFoodInfo] = useState(food)
    var [isMOdify,setIsModify] = useState(false)
    var [foodProps,setFoodProps] = useState({
        name :food.name ,
        desc :food.desc ,
        price :food.price ,
        category :food.category,
        status:food.status
    })
    function save(){
        console.log(food)
        api.put(`/restaurant/${food.rid}/food/` + food.id,foodProps).then( (foodInfo) =>{
            //这个api还得改一下
            // console.log(foodInfo)
            setFoodInfo(foodInfo.data)
        })
        setIsModify(!isMOdify)
        //重新把食品信息渲染出来
    }
    //菜品修改,后端然后把菜单信息返回来与同时渲染到页面上
    function change(e){
        setFoodProps({
            ...foodProps,
        [e.target.name] : e.target.value
        })
    }
    return (
        <div style={{width:'100%',height:'250px',border:'1px solid red'}}>
            <h3>{food.name}</h3>
            {
                !isMOdify?
            <div>
                <img src={food.img} alt={food.name}></img>
                <p>顾客评价:{food.desc}</p>
                <p>价格:{food.price}</p>
                <p>分类:{food.category?food.category:'暂未分类'}</p>
            </div>:
            <div>
                名称:<input type='text' onChange={change} defaultValue={foodInfo.name} name='name'></input>
                描述:<input type='text' onChange={change} defaultValue={foodInfo.desc} name='desc'></input>
                价格:<input type='text' onChange={change} defaultValue={foodInfo.price} name='price'></input>
                分类:<input type='text' onChange={change} defaultValue={foodInfo.category} name='category'></input>
            </div>
            }
            <div>
                <button onClick={()=>{setIsModify(true)}}>修改</button>
                <button onClick={save}>保存</button>
                {food.status === 'on' && 
                <button>上架</button>}
                {food.status === 'off' && 
                <button>下架</button>}
                <button>删除</button>
            </div>
        </div>
    )
}
export default function FoodManage(){
    var [foods,setFoods] = useState([])
    useEffect( () => {
        api.get(`/restaurant/food`).then(res =>{
            setFoods(res.data)
        })
    },[])
    console.log( foods )
    //拿到所有食物列表 ,
    return (
        <div> 
            {
                foods.map(food => {
                    return (
                        <FoodItem key={food.id} food={food}/>
                    )
                })
            }
        </div>
    )
}