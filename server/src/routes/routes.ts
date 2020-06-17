/*
 * @Description: 路由配置
 */

import Router from 'koa-router';
import controObj from '../controllers';

const router = new Router({
    prefix: '/api' //统一前缀
})

controObj.controllers.forEach((item: any) => {
    router.get(`/${item.routerName}/*`, async (ctx: any, next: any) => {
        let fn: string = ctx.url.split("/")[3].split("?")[0]; //获取请求的方法
        let res: any = await item[fn](ctx.request, next);
        ctx.body = res;
    })
    router.post(`/${item.routerName}/*`, async (ctx: any, next: any) => {
        let fn: string = ctx.url.split("/")[3]; //获取请求的方法
        if (fn === 'loginValidation') {
            ctx.body = await item[fn](ctx.request.body, ctx);
        }
        ctx.body = await item[fn](ctx.request.body, next);
    })
});

export default router.routes();