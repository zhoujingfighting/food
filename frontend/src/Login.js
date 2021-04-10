import React, { useRef} from 'react'
import { withRouter } from 'react-router'
import './css/login.css'
import api from './api'
export default withRouter(function Login(props){
    var nameref = useRef()
    var passwordref = useRef()
    async function login(e){
        e.preventDefault()
        var name = nameref.current.value
        var password = nameref.current.value
        try{
           var res =  await api.post('/login',{name,password})
            console.log(res.status)
            props.history.push('/manage') 
        }catch(error){
                alert('登录名或者密码错误')
        }

    }
    return (
    <div>
        <div className='background'>
        </div>
        <div className='login'>
            <div className='title'> 
                <h1>餐厅管理员登录</h1>
            </div>
            <div className='form'>
                <form onSubmit={login}>
                    <div className='flex'>
                        <span>用户名:</span>
                        <input type = 'text' ref={nameref} placeholder='请输入账户名'/>
                    </div>
                    <div className='flex'>
                        <span>密&nbsp;&nbsp;&nbsp;码:</span>
                        <input type = 'password' ref={passwordref} />
                    </div>
                    <div className='button'>
                        <button>点击此处登录</button>
                    </div>
                </form>
            </div>
        </div>
     </div>
    )
})
// --------------------------------------------------------
/* eslint-enable no-template-curly-in-string */

// export default withRouter(function Login(props){
//         var nameref = useRef()
//     var passwordref = useRef()
//   const layout = {
//         labelCol: {span: 8,},
//         wrapperCol: { span: 16,},
//       };
//   const onFinish = (values) => {console.log(values);};
//   const validateMessages = {
//     required: '${label} is required!',
//     types: {
//       email: '${label} is not a valid email!',
//       number: '${label} is not a valid number!',
//     },
//     number: {
//       range: '${label} must be between ${min} and ${max}',
//     },
//   };
//   async function login(e){
//             e.preventDefault()
//             var name = nameref.current.value
//             var password = passwordref.current.value
//             try{
//                var res =  await api.post('/login',{name,password})
//                 console.log(res.status)
//                 props.history.push('/manage') 
//             }catch(error){
//                     alert('登录名或者密码错误')
//             }
//         }
//   return (
//     <Form {...layout} name="nest-messages" onFinish={onFinish} validateMessages={validateMessages} onSubmit={login}>
//       <Form.Item
//         name={['user', 'name']}
//         label="Name"
//         rules={[
//           {
//             required: true,
//           },
//         ]}
//       >
//         <Input ref={nameref}/>
//       </Form.Item>
//       <Form.Item
//         name={['user', 'email']}
//         label="Email"
//         rules={[
//           {
//             type: 'email',
//           },
//         ]}
//       >
//         <Input ref={passwordref}/>
//       </Form.Item>
//       <Form.Item
//         name={['user', 'age']}
//         label="Age"
//         rules={[
//           {
//             type: 'number',
//             min: 0,
//             max: 99,
//           },
//         ]}
//       >
//         <InputNumber />
//       </Form.Item>
//     </Form>
//   );
// })