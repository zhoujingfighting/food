import React, { useRef} from 'react'
import { withRouter } from 'react-router'
import './css/register.css'
import api from './api'
export default withRouter(function Register(props){
    var nameref = useRef()
    var passwordref = useRef()
    var emailref = useRef()
    var titleref = useRef()
    async function register(e){
        e.preventDefault()
        var name = nameref.current.value 
        if(!name.length){
            alert('用户名不能为空')
            return
        }    
        var email = emailref.current.value
        var password = nameref.current.value
        var title = titleref.current.value
        try{
            await api.post('/register',{name,email,password,title})
            props.history.push('/login') 
        }catch(error){
                alert('此用户名已经存在')
        }
    }
    return (
        <div className='register'>
            <div className='title'>
                <h1>餐厅管理员注册</h1>
            </div>
            <form onSubmit={register}>
                <div className='flex'>
                    <span>用户名:</span>
                    <input type = 'text' ref={nameref} placeholder='请输入用户名'/>
                </div> 
                <div className='flex'>
                    <span >邮&nbsp;&nbsp;&nbsp;箱:</span>
                    <input type = 'email' ref={emailref} />
                </div> 
                <div className='flex'>
                    <span >密&nbsp;&nbsp;&nbsp;码:</span>
                    <input type = 'password' ref={passwordref}/>
                </div>
                <div className='flex'>
                    <span>餐厅名:</span>
                    <input type = 'text' ref={titleref} placeholder='请输入餐厅名称'/>
                </div>
                <div className='button'>
                    <button>点击此处注册您的餐厅</button>
                </div>
                
            </form>
        </div>
    )
})

