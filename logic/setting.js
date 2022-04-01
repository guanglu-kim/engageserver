const event = require(`../core/event`);
const es = require(`../util/es`);
const setting = require(`../util/setting`);

const index = `setting`;

async function init() {
  await es.initIndex(index);

  event.sub(index, `${index}.default.put`, async (payload) => {
    const { value } = payload;
    await setting.setDefaultSetting(value);
  });
}

async function initData() {
  await setting.initSetting({
    key: `base`,
    value: {
      token: 10,
      refreshToken: 60,
      systenName: `我只到了 刷新的不是我的值`,
      tablePageSize: 20,
    },
  });

  await setting.initSetting({
    key: `active`,
    value: {
      activeUserRule: 15,
      activeFunctionRule: 15,
    },
  });
}

module.exports = {
  init,
  initData,
};
