const router = require("koa-router")();
const util = require(`../util`);
const es = require(`../util/es`);
const event = require(`../core/event`);
const coreAuth = require(`../core/auth`);

const index = `auth`;

router.put(`/account`, async (ctx) => {
  // 参数检测
  const { body } = ctx.request;

  // 写入数据

  const { traceId } = ctx.request.headers;
  const ret = await event.pub(`${index}.account.put`, { value: body }, traceId);

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

  util.send200(ctx, ret);
});

router.put(`/role`, async (ctx) => {
  // 参数检测

  const { body } = ctx.request;
  if (!body || !body.id) {
    util.send400(ctx, `参数中缺少Id信息`);
    return;
  }
  const { traceId } = ctx.request.headers;
  const ret = await event.pub(`${index}.role.put`, { value: body }, traceId);

  util.send200(ctx, ret);
});

router.get(`/role/:id`, async (ctx) => {
  const id = ctx.request.params.id;
  console.log(id);
  const detail = await es.get(`authrole`, ctx.request.params.id);
  util.send200(ctx, detail);
});

router.get(`/account/:id`, async (ctx) => {
  const { id } = ctx.request.params;
  const ret = await es.get(`authaccount`, id);
  util.send200(ctx, ret ? ret : { list: [] });
});

router.get(`/`, async (ctx) => {
  const token = coreAuth.decode(ctx.request.header.authorization.split(" ")[1]);
  var id = token._id;
  const ret = (await es.get(`authaccount`, id)) ?? { list: [] };
  util.send200(ctx, ret);
});

module.exports = router;
