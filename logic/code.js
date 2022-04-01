const es = require(`../util/es`);

const index = `code`;

async function init() {
  await es.initIndex(`code`);
}

async function initData() {}

module.exports = {
  init,
  initData,
};
