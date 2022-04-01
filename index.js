const Koa = require(`koa`);
const app = new Koa();
const lodash = require(`lodash`);
const path = require(`path`);
const serve = require(`koa-static`);

// 统一放到public中管理

const home = serve(path.join(__dirname) + `/static/`);
app.use(home);

// 初始化环境变量

const env = require(`./util/env`);
env.init();

// 初始化

const init = require(`./core/init`);
init.run();

// 设置时区

process.env.TZ = `Asia/Shanghai`;

// cors

const cors = require("koa-cors");
app.use(cors({ methods: [`GET`, `POST`, `DELETE`, `PUT`, `PATCH`, `HEAD`] }));

// 记录中间件
const uuid = require(`uuid`);
app.use(async (ctx, next) => {
  // 生成traceId
  const traceId = uuid.v4();
  ctx.headers.traceId = traceId;
  try {
    await next();
  } catch (err) {
    console.log(`系统错误`);
    console.log(err);
  }

  // TODO:写入请求日志 需要补充 用户信息 和 当前时间
  // const log = { request: ctx.request, response: ctx.response };
});

// 自定义401错误

app.use(function (ctx, next) {
  return next().catch((err) => {
    if (err.status === 401) {
      ctx.status = 401;
      ctx.body = {
        error: err.originalError ? err.originalError.message : err.message,
      };
    } else {
      throw err;
    }
  });
});

//jwt 认证
const jwt = require(`koa-jwt`);
app.use(
  jwt({ secret: `secret123`, algorithms: ["HS256"] }).unless({
    path: ["/login", `/login/token`, `/setting/default/base`],
  })
);

// 表单及文件上传

const koaBody = require(`koa-body`);
app.use(
  koaBody({
    multipart: true,
    formidable: {
      maxFileSize: 200 * 1024 * 1024, // 设置上传文件大小最大限制，默认2M
      multipart: true,
    },
  })
);

// 组装路由

const Router = require("koa-router");
let router = new Router();

const requireAll = require("require-all");
const routes = requireAll(path.resolve(`./routes`));
lodash.mapKeys(routes, (v, key) => {
  router.use(`/${key}`, v.routes());
});

app.use(router.routes());
app.use(router.allowedMethods());

// https

const https = require(`https`);
const sslify = require(`koa-sslify`).default;
const fs = require(`fs`);

const options = {
  key: fs.readFileSync("./ssl/yysmartcity.com.key"),
  cert: fs.readFileSync("./ssl/yysmartcity.com_bundle.pem"),
};

app.use(sslify());

https.createServer(options, app.callback()).listen(3004, (err) => {
  if (err) {
    console.log(`服务器启动出错`);
    console.log(err);
  }
  {
    console.log(`服务器启动`);
  }
});

// http

const http = require(`http`);
http.createServer(app.callback()).listen(3005);

module.exports = app.listen(3006);

// 初始化 schedule

require(`./util/schedule`).run();
