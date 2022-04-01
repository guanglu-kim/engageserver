const router = require("koa-router")();
const util = require(`../util`);
const es = require(`../util/es`);
const event = require(`../core/event`);

const index = `account`;

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

router.put(`/password`, async (ctx) => {
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
  const ret = await event.pub(`${index}.password.put`, { origin, value: body }, traceId);

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
    util.send504(ctx, ret);
    return;
  }

  // 返回结果

  util.send200(ctx);
});

router.get(`/page`, async (ctx) => {
  const { current, pageSize } = ctx.request.query;
  const sort = es.getSortFilter({ account: `asc` });
  const query = es.getQueryFilter();
  query.bool.must_not = [
    {
      query_string: {
        fields: [`id`],
        query: `admin`,
      },
    },
  ];
  const ret = await es.getDocsByPage(index, query, sort, current, pageSize);
  util.send200(ctx, ret);
});

router.get(`/`, async (ctx) => {
  const sort = es.getSortFilter({ account: `asc` });
  const query = es.getQueryFilter();
  query.bool.must_not = [
    {
      query_string: {
        fields: [`id`],
        query: `admin`,
      },
    },
  ];
  const ret = await es.getDocs(index, query, sort);
  util.send200(ctx, ret);
});

router.get(`/leader`, async (ctx) => {
  const sort = es.getSortFilter({ account: `asc` });
  const query = es.getQueryFilter({ "orgs.isLeader": true });
  query.bool.must_not = [
    {
      query_string: {
        fields: [`id`],
        query: `admin`,
      },
    },
  ];
  console.log(query.bool.filter)
  const ret = await es.getDocs(index, query, sort);
  console.log(`leaders`, ret);
  util.send200(ctx, ret);
});

router.get(`/:id`, async (ctx) => {
  const { id } = ctx.request.params;
  const ret = await es.get(index, id);
  util.send200(ctx, ret);
});

router.post(`/:id/enable`, async (ctx) => {
  const { id } = ctx.request.params;
  const origin = await es.get(index, id);

  if (!origin) {
    util.send404(ctx, `未找到id为${id}的数据`);
    return;
  }

  const { traceId } = ctx.request.headers;
  const ret = await event.pub(`${index}.enable`, { value: origin }, traceId);

  // 错误处理

  if (!ret.success) {
    util.send504(ctx, ret);
    return;
  }

  // 返回结果

  util.send200(ctx);
});

router.post(`/:id/disable`, async (ctx) => {
  const { id } = ctx.request.params;
  const origin = await es.get(index, id);

  if (!origin) {
    util.send404(ctx, `未找到id为${id}的数据`);
    return;
  }

  const { traceId } = ctx.request.headers;
  const ret = await event.pub(`${index}.disable`, { value: origin }, traceId);

  // 错误处理

  if (!ret.success) {
    util.send504(ctx, ret);
    return;
  }

  // 返回结果

  util.send200(ctx);
});

module.exports = router;
