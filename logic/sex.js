const event = require(`../core/event`);
const es = require(`../util/es`);
const gb = require(`../core/GB`)

const index = `sex`;

async function init() {
    await es.initIndex(`sex`, gb.getData(`sex`));

  event.sub(index, `${index}.post`, async (payload) => {
    const { value } = payload;
    const query = es.getQueryFilter({ code: value.code });

    const ret = await es.getDocs(index, query);
    if (ret.length > 0) {
      return {
        deny: true,
        message: `编码值重复`,
      };
    }
    await es.index(index, value);
  });

  event.sub(index, `${index}.put`, async (payload) => {
    const { value } = payload;
    var query = es.getQueryFilter({ code: value.code });
    console.log(query.bool);
    query.bool.must_not = [
      {
        query_string: {
          default_field: `id`,
          query: value.id,
        },
      },
    ];

    console.log(query);

    const ret = await es.getDocs(index, query);
    if (ret.length > 0) {
      return {
        deny: true,
        message: `编码值重复`,
      };
    }

    await es.index(index, value);
  });

  event.sub(index, `${index}.delete`, async (payload) => {
    const { value } = payload;
    await es.remove(index, value.id);
  });
}

async function initData(){

}

module.exports = {
  init,
  initData,
};
