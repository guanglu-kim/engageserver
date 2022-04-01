const router = require("koa-router")();
const coreAuth = require(`../core/auth`);
const util = require(`../util`);
const moment = require(`moment`);
const es = require(`../util/es`);
const event = require(`../core/event`);

router.post(`/`, async (ctx) => {
  // 投递消息

  const { traceId } = ctx.request.headers;
  const ret = await event.pub(`login`, { value: ctx.request.body }, traceId);

  // 错误处理

  if (!ret.success) {
    if (ret.deny) {
      console.log(ret);
      util.send403(ctx, ret.message);
      return;
    } else {
      util.send504(ctx, ret);
      return;
    }
  }
  // 返回结果
  util.send200(ctx, ret.data);
});

router.post(`/token`, async (ctx) => {
  // 投递消息

  const { traceId } = ctx.request.headers;
  const ret = await event.pub(
    `login.refreshToken`,
    { value: ctx.request.body },
    traceId
  );

  // 错误处理

  if (!ret.success) {
    if (ret.deny) {
      console.log(ret);
      util.send403(ctx, ret.message);
      return;
    } else {
      util.send504(ctx, ret);
      return;
    }
  }
  // 返回结果
  ctx.body = ret.data;
});

module.exports = router;
