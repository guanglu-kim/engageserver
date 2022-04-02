const es = require(`../util/es`);
const path = require(`path`);
const lodash = require(`lodash`);

async function run() {
  // 初始化 logic 模块
  try {
    const logics = [];
    const requireAll = require("require-all");
    const routes = requireAll(path.resolve(`./logic`));
    lodash.mapKeys(routes, (v) => logics.push(v));
    for (let logic of logics) await logic.init();
    for (let logic of logics) await logic.initData();
  } catch (err) {
    console.log(`初始化 logic 发生错误`);
    console.log(err);
  }
}

module.exports = {
  run,
};
