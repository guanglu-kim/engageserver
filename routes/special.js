const router = require("koa-router")();
const util = require(`../util`);
const es = require(`../util/es`);
const event = require(`../core/event`);

const index = `special`;

router.post(`/`, async (ctx) => {
  // 参数检测

  const { body } = ctx.request;

  if (!body || !body.id) {
    util.send404(ctx, `参数中缺少Id信息`);
    return;
  }

  // 投递消息

  const { traceId } = ctx.request.headers;
  const ret = await event.pub(`${index}.post`, { value: body }, traceId);

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

  util.send200(ctx);
});

router.delete(`/:id`, async (ctx) => {
  // 参数检测

  const { id } = ctx.request.params;

  // 投递消息

  const origin = await es.get(index, id);

  if (!origin) {
    util.send404(ctx, `未找到id为${id}的数据`);
    return;
  }

  const { traceId } = ctx.request.headers;
  const ret = await event.pub(`${index}.delete`, { value: origin }, traceId);

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

  util.send200(ctx);
});

router.get(`/`, async (ctx) => {
  const { leaderId } = ctx.request.query;

  const query = es.getQueryFilter({ "leader.id": leaderId });
  const docs = await es.getDocs(index, query);

  util.send200(ctx, docs);
});

module.exports = router;
