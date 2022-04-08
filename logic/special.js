const event = require(`../core/event`);
const es = require(`../util/es`);

const index = `special`;

async function init() {
  await es.initIndex(`special`);

  event.sub(index, `${index}.post`, async (payload) => {
    const { value } = payload;
    await es.index(index, value);
  });

  event.sub(index, `${index}.delete`, async (payload) => {
    const { value } = payload;
    await es.remove(index, value.id);
  });
}

async function initData() {}

module.exports = {
  init,
  initData,
};
