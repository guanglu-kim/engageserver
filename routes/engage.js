const router = require("koa-router")();
const util = require(`../util`);
const es = require(`../util/es`);
const event = require(`../core/event`);
const index = `engage`;
const coreAuth = require(`../core/auth`);

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

  const origin = await es.get(`engage`, id);
  if (origin == undefined) {
    util.send404(ctx, `未找到指定的资源`);
    return;
  }
  // 投递消息

  const { traceId } = ctx.request.headers;
  const ret = await event.pub(
    `${index}.delete`,
    { origin, value: { id } },
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

  util.send200(ctx);
});

router.post(`/schedule`, async (ctx) => {
  const { body } = ctx.request;

  if (!body || body.length == 0) {
    util.send404(ctx, `缺少参数信息`);
    return;
  }

  // 投递消息

  const { traceId } = ctx.request.headers;
  const ret = await event.pub(`${index}.schedule`, { value: body }, traceId);

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

router.post(`/special`, async (ctx) => {
  const { body } = ctx.request;

  if (!body) {
    util.send404(ctx, `缺少参数信息`);
    return;
  }

  // 投递消息

  const { traceId } = ctx.request.headers;
  const ret = await event.pub(`${index}.special`, { value: body }, traceId);

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

router.get(`/leader`, async (ctx) => {
  // 获取当前人员
  const user = coreAuth.analysUser(ctx);
  const account = await es.get(`account`, user._id);

  const result = [];

  for (let org of account.orgs) {
    const item = {};
    // 找到领导
    const doc = await es.get(`org`, org.id);
    const leader = doc.members.find((v) => v.isLeader);
    if (leader == undefined) continue;
    item.leader = leader;

    // 查找改领导的所有预约申请
    const query = es.getQueryFilter({ "target.id": leader.id });
    const engages = await es.getDocs(`engage`, query);
    item.engages = engages;

    result.push(item);
  }

  util.send200(ctx, result);
});

router.get(`/`, async (ctx) => {
  const user = coreAuth.analysUser(ctx);

  const result = [];

  // 我的预约
  {
    const query = es.getQueryFilter({ "creator.id": user._id });
    const doc = await es.getDocs(`engage`, query);
    result.push(...doc);
  }

  // 被预约成行
  {
    const query = es.getQueryFilter({
      "target.id": user._id,
      status: `confirm`,
    });
    const doc = await es.getDocs(`engage`, query);
    result.push(...doc);
  }

  util.send200(ctx, result);
});

module.exports = router;
