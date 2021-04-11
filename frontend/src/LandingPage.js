import React, { Suspense , useState } from 'react';
import { withRouter } from 'react-router';
import api from './api';
import createFetcher from './fetcher';
import './css/landingpage.css'
var fetcher = createFetcher( (did) =>{
    return api.get('/deskinfo?did=' + did , {
        did : did
    })
})
function DeskInfo({did}){
    var info = fetcher.read(did).data
    console.log(info)
    return (
        <div>
            <span>{info.name}</span>
            {/* 桌号 和 餐厅名字(后端的数据库关键字里面有title) */}
            <span>{info.title}</span>
        </div>
    )
}
export default withRouter(function LandingPage(props){
    var [cumstom ,setCustom] = useState(0)
    var rid = props.match.params.rid
    var did = props.match.params.did
    function startOrder(){
        props.history.push(`/r/${rid}/d/${did}?customCount=${cumstom}`)
    }
    // 获取餐厅信息
    // fetcher 和 suspense
    return (
        <div>
            <Suspense fallback = { <div>正在加载桌面信息</div>} >
                <DeskInfo did={did} />
            </Suspense>
           <h2> 选择人数 </h2> 
           <li className={cumstom === 1 ?'active':null} onClick={()=>{setCustom(1)}}>1</li>
           <li className={cumstom === 2 ?'active':null} onClick={()=>{setCustom(2)}}>2</li>
           <li className={cumstom === 3 ?'active':null} onClick={()=>{setCustom(3)}}>3</li>
           <li className={cumstom === 4 ?'active':null} onClick={()=>{setCustom(4)}}>4</li>
            展示餐厅和桌面信息
            开始点餐按钮
            <button onClick={startOrder}>
                开始点餐
            </button>
        </div>
    )
})