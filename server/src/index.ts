import koa from 'koa';
import koaBody from 'koa-body';
import router from './routes/routes';
const config = require('./config');


const app = new koa();



app.use(koaBody({
    multipart:true, /*支持form-data形式文件/键值对传值*/
}
));


app.use(router);
//配置CSRF跨域
app.use(async(ctx,next)=>{
    //指定请求源
    ctx.set("Access-Control-Allow-Origin","*");
    //指定请求的方式
    ctx.set("Access-Control-Allow-Methods", "OPTIONS,POST,GET,HEAD,DELETE,PUT");
    next();
})
app.listen(config.SERVER_PORT,()=>{
    console.log("server running at",config.SERVER_PORT);
})
