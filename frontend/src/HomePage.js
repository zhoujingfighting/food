import React from 'react'
import { Link } from 'react-router-dom'
//直接跳转
import './css/homepage.css'
export default function HomePage(){
    return (
        <div className='homepage-title'>
            <div className='home-bg'></div>
            <h1 className='home-title'>
                欢迎使用墨灵点餐
            </h1>
            <div className='homepage-login'>
               <Link to ='/login' replace>
                   <span className='c'>登录</span>
                </Link> 
            </div>
            <div className='homepage-register'>
                <Link to = '/register' replace>
                   <span className='reg-span'>注册</span> 
                </Link>
            </div>
        </div>
    )
}