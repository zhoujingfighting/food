import React from 'react'
import { Link } from 'react-router-dom'
import './css/homepage.css'
export default function HomePage(){
    return (
        <div>
            <Link to ='/login' replace>登录</Link>
            {/*  */}
            <Link to = '/register' replace>注册</Link>
            {/* component={Register} */}
        </div>
    )
}