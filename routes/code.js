const router = require("koa-router")();
const util = require(`../util`);

router.post(`/:domain`, async (ctx) => {
  const { domain } = ctx.request.params;
  const { pre, type, width } = ctx.request.body;
  const code = await util.getCode(domain, pre, type, width);
  
  util.send200(ctx, { code: code });
});

module.exports = router;
