const { FORMERR } = require("dns");
const event = require(`../core/event`);
const es = require(`../util/es`);

const index = `account`;

async function init() {
  await es.initIndex(`account`);

  event.sub(index, `${index}.post`, async (payload) => {
    const { value } = payload;
    const query = es.getQueryFilter({ account: value.account });

    const tmp = Number(value.account);
    if (tmp > 0)
      return {
        deny: true,
        message: `不能使用数字建立账号`,
      };

    const ret = await es.getDocs(index, query);
    if (ret.length > 0) {
      return {
        deny: true,
        message: `账户重复`,
      };
    }
    await es.index(index, value);
  });

  event.sub(index, `${index}.put`, async (payload) => {
    const { value } = payload;
    const query = es.getQueryFilter({ account: value.account });
    query.bool.must_not = [
      {
        query_string: {
          default_field: `id`,
          query: value.id,
        },
      },
    ];

    const tmp = Number(value.account);
    if (tmp > 0)
      return {
        deny: true,
        message: `不能使用数字建立账号`,
      };

    const ret = await es.getDocs(index, query);
    if (ret.length > 0) {
      return {
        deny: true,
        message: `账户重复`,
      };
    }
    await es.index(index, value);
  });

  event.sub(index, `${index}.delete`, async (payload) => {
    const { value } = payload;
    await es.remove(index, value.id);
  });

  event.sub(index, `${index}.password.put`, async (payload) => {
    console.log(`password`);
    const { value } = payload;
    console.log(value);
    const doc = await es.get(index, value.id);
    doc.password = value.password;
    await es.index(index, doc);
  });

  event.sub(index, `${index}.enable`, async (payload) => {
    const { value } = payload;
    value.state = "enable";

    await es.index(index, value);
  });

  event.sub(index, `${index}.disable`, async (payload) => {
    const { value } = payload;
    value.state = "disable";

    await es.index(index, value);
  });

  event.subBefore(index, `sex.delete`, async (payload) => {
    const { value } = payload;
    var query = es.getQueryFilter({ "sex.id": value.id });

    const ret = await es.getDocs(index, query);
    if (ret.length > 0) {
      return {
        deny: true,
        message: `该内容被{}使用，无法删除`,
      };
    }
  });

  event.subAfter(index, `sex.post`, async (payload) => {
    const { origin, value } = payload;
    var query = es.getQueryFilter({ "sex.id": origin.id });
    const ret = await es.getDocs(index, query);

    // todo 最多一万分 效率低 index query 批量修改

    for (let index = 0; index < ret.length; index++) {
      const element = ret[index];
      element.sex = value;
      await es.index(index, element);
    }
  });

  event.subAfter(index, `org.members.post`, async (payload) => {
    const { origin, value } = payload;
    value.members.map(async (v) => {
      const doc = await es.get(index, v.id);
      if (!doc.orgs) doc.orgs = [];

      const find = doc.orgs.find((f) => f.id == origin.id);
      const { id, name, code } = origin;
      if (find) find = { id, name, code };
      else doc.orgs.push({ id, name, code });

      await es.index(index, doc);
    });
  });

  event.subAfter(index, `org.members.delete`, async (payload) => {
    const { origin, value } = payload;
    value.members.map(async (v) => {
      const doc = await es.get(index, v.id);
      if (!doc.orgs) doc.orgs = [];

      const findIndex = doc.orgs.findIndex((f) => f.id == origin.id);
      if (findIndex != -1) {
        doc.orgs.splice(findIndex, 1);
        await es.index(index, doc);
      }
    });
  });

  event.subAfter(index, `org.put`, async (payload) => {
    const { origin, value } = payload;

    const { leader } = value;

    // 同步名称 及 更新领导标记

    for (let member of origin.members) {
      const doc = await es.get(`account`, member.id);
      if(doc==undefined) continue;
      console.log(`doc`, doc);
      if (!doc.orgs) doc.orgs = [];
      for (let org of doc.orgs) {
        console.log(`org`, org);
        if (org.id == origin.id) org.name = value.name;
        if (org.isLeader && leader.id != doc.id) org.isLeader = false;
        if (leader.id == doc.id) org.isLeader = true;
      }
      await es.index(`account`, doc);
    }
  });
}

async function initData() {
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
  init,
  initData,
};
