const event = require(`../core/event`);
const es = require(`../util/es`);

async function init() {
  await es.initIndex(`authaccount`);
  await es.initIndex(`authrole`);

  event.sub(`authaccount`, `auth.account.put`, async (payload) => {
    const { value } = payload;
    const ret = await es.index(`authaccount`, value);
    return ret;
  });

  event.sub(`authrole`, `auth.role.put`, async (payload) => {
    const { value } = payload;
    await es.index(`authrole`, value);
  });
}

async function initData() {
  await es.index(`authaccount`, {
    id: `admin`,
    list: [
      `setting.base`,
      `setting.active`,
      `account.add`,
      `account.list`,
      `org`,
      `log`,
      `publicuser.list`,
      `role.add`,
      `role.list`,
      `auth.account`,
      `auth.role`,
      `count.register`,
      `count.online`,
      `count.active.user`,
      `count.active.fun`,
      `process`,
    ],
  });
}

module.exports = {
  init,
  initData,
};
