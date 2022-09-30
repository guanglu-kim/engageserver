const router = require("koa-router")();
const util = require(`../util`);
const es = require(`../util/es`);
const event = require(`../core/event`);

router.post(`/register`, async (ctx) => {
    // 参数检测

    const { body } = ctx.request;

    if (!body || !body.id) {
        util.send404(ctx, `参数中缺少Id信息`);
        return;
    }

    // 投递消息

    const { traceId } = ctx.request.headers;
    const ret = await event.pub(`push.register`, { value: body }, traceId);

    // 错误处理

    if (!ret.success) {
        console.log(ret);
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

router.post(`/clean`, async (ctx) => {
    // 参数检测

    const { body } = ctx.request;

    if (!body || !body.id) {
        util.send404(ctx, `参数中缺少Id信息`);
        return;
    }

    // 投递消息

    const { traceId } = ctx.request.headers;
    const ret = await event.pub(`push.clean`, { value: body }, traceId);

    // 错误处理

    if (!ret.success) {
        console.log(ret);
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
