const es = require(`../util/es`);
const gb = require(`./GB`);
const path = require(`path`);
const lodash = require(`lodash`);

async function run() {
  // 初始化 logic 模块
  try {
    const requireAll = require("require-all");
    const routes = requireAll(path.resolve(`./logic`));
    await lodash.mapKeys(routes, async (v) => {
      await v.init();
    });

    await lodash.mapKeys(routes, async (v) => {
      await v.initData();
    });
  } catch (err) {
    console.log(`初始化 logic 发生错误`);
    console.log(err);
  }
}

// 初始化超级管理员
async function initAdmin() {
  const index = `account`;
  const client = es.getESClient();

  const exists = await client.exists({ index, id: `admin` });
  if (exists) return;

  const data = {
    account: `admin`,
    name: `管理员`,
    password: `admin`,
    id: `admin`,
  };

  await client.index({ index, id: data.id, body: data });
}

module.exports = {
  run,
};
