const router = require("koa-router")();
const util = require(`../util`);
const es = require(`../util/es`);
const event = require(`../core/event`);
const setting = require(`../util/setting`);

const index = `setting`;

router.put(`/default/:key`, async (ctx) => {
  // 参数检测
  const { key } = ctx.request.params;
  const { body } = ctx.request;
  const { traceId } = ctx.request.headers;


  // 读取原始配置

  const orign = await setting.getDefaultSetting(key);
  if (orign == undefined) {
    util.send403(ctx, `未找到${key}相关配置`);
    return;
  }

  // 投递消息

  const ret = await event.pub(
    `${index}.default.put`,
    {
      value: {
        key,
        value: body,
      },
    },
    traceId
  );

  // 错误处理

  if (!ret.success) {
    if (ret.deny) {
      util.send403(ctx, ret.message);
      return;
    } else {
      util.send504(ctx, ret);
      return;
    }
  }

  // 返回结果

  util.send200(ctx);
});

router.get(`/default/:key`, async (ctx) => {
  const { key } = ctx.request.params;
  const ret = await setting.getDefaultSetting(key);
  if (ret == undefined) {
    util.send403(ctx, `未找到${key}相关配置`);
    return;
  }
  util.send200(ctx, ret.value);
});

module.exports = router;
