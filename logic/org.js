const event = require(`../core/event`);
const es = require(`../util/es`);
const util = require(`../util`);

const index = `org`;

async function init() {
  await es.initIndex(`org`);

  event.sub(index, `${index}.post`, async (payload) => {
    const { value } = payload;
    value.members = [];
    await es.index(index, value);
  });

  event.sub(index, `${index}.put`, async (payload) => {
    const { origin, value } = payload;
    const obj = util.cloneJson(origin);
    obj.name = value.name;
    // 修改领导
    const { leader } = value;

    for (let member of obj.members) {
      console.log(member);
      if (member.isLeader) member.isLeader = false;
      if (member.id == leader.id) member.isLeader = true;
    }
    await es.index(index, obj);
  });

  event.sub(index, `${index}.delete`, async (payload) => {
    const { origin } = payload;

    if (origin.members.length > 0)
      return {
        deny: true,
        message: `请先移除成员`,
      };

    const query = es.getQueryFilter({ parentId: origin.id });
    const ret = await es.getDocs(index, query);
    if (ret.length > 0)
      return {
        deny: true,
        message: `请先删除下级组织机构`,
      };

    await es.remove(index, origin.id);
  });

  event.sub(index, `${index}.members.post`, async (payload) => {
    const { origin, value } = payload;
    for (let item of value.members) {
      const find = origin.members.find((v) => v.id == item.id);
      if (find) continue;
      origin.members.push(item);
    }
    await es.index(index, origin);
  });

  event.sub(index, `${index}.members.delete`, async (payload) => {
    const { origin, value } = payload;
    value.members.map((v) => {
      const findIndex = origin.members.findIndex((f) => f.id == v.id);
      if (findIndex != -1) origin.members.splice(findIndex, 1);
    });

    await es.index(index, origin);
  });
}

async function initData() {
  await es.initData(index, {
    id: `root`,
    name: "组织机构",
    code: "0001",
    parentId: "0",
    members: [],
  });
}

module.exports = {
  init,
  initData,
};
