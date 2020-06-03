/*
 * @Description: 路由配置
 */
import Router from 'koa-router';
import controObj from '../controllers';
const router  = new Router({
    prefix:'/api' //统一前缀
})

controObj.controllers.forEach( (item:any)=> {
    router.post(`/${item.routerName}/*`,async (ctx:any,next:any)=>{
        let fn:string = ctx.url.split("/")[3]; //获取请求的方法
        let res : any = await item[fn](ctx.request.body,next);
        ctx.body = res; 
    })
});

export default router.routes();