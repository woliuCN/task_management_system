import koa from 'koa';
import koaBody from 'koa-body';
import router from './routes/routes';
import cors from 'koa2-cors';
import koa_session from 'koa-session';
import { sessionMiddleWare } from './common/utils';
import { permissionIntercept } from './common/blackList';
const config = require('./config');

const app = new koa();
const session = koa_session(config.SESSION_CONFIG, app)
app.keys = config.SESSION_SIGNED_KET;

//配置跨域资源共享
app.use(cors({
    origin: function (ctx) {
        if (ctx.header.origin) {
            return ctx.header.origin;
        }
        return '*';
    },
    maxAge: 5, //指定本次预检请求的有效期，单位为秒。
    credentials: true, //是否允许发送Cookie
    allowMethods: ['GET', 'POST', 'DELETE', 'PUT'], //配置请求方式
    allowHeaders: ['Content-Type', 'Authorization', 'Accept'], //配置支持的头部信息
}));

//body信息获取中间件
app.use(koaBody({
    multipart: true, /*支持form-data形式文件/键值对传值*/
    formidable: {
        multiples: true,
    }
}
));

//session 登录状态验证
app.use(session);
app.use(sessionMiddleWare);

app.use(permissionIntercept);
app.use(router);

app.listen(config.SERVER_PORT, () => {
    console.log("server running at", config.SERVER_PORT);
})
