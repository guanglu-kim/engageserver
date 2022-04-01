const router = require("koa-router")();
const util = require(`../util`);
const es = require(`../util/es`);
const event = require(`../core/event`);

const index = `org`;

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

router.put(`/`, async (ctx) => {
  // 参数检测

  const { body } = ctx.request;

  if (!body || !body.id) {
    util.send400(ctx, `参数中缺少Id信息`);
    return;
  }

  // 投递消息

  const origin = await es.get(index, body.id);

  if (!origin) {
    util.send404(ctx, `未找到id为${body.id}的数据`);
    return;
  }

  const { traceId } = ctx.request.headers;
  const ret = await event.pub(`${index}.put`, { origin, value: body }, traceId);

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
  const ret = await event.pub(
    `${index}.delete`,
    { origin, value: { id } },
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

router.get(`/`, async (ctx) => {
  const ret = await es.getDocs(index);
  util.send200(ctx, ret);
});

router.patch(`/:id/members`, async (ctx) => {
  const { body } = ctx.request;

  const { id } = ctx.request.params;
  const origin = await es.get(index, id);

  if (!origin) {
    util.send404(ctx, `未找到id为${id}的数据`);
    return;
  }

  const { traceId } = ctx.request.headers;
  var ret = {};
  if (body.operation == `add`)
    ret = await event.pub(
      `${index}.members.post`,
      { origin, value: body },
      traceId
    );
  else
    ret = await event.pub(
      `${index}.members.delete`,
      { origin, value: body },
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

module.exports = router;
