const es = require(`./es`);

function getCodeCondition(code) {
  let ret = code;

  while (true) {
    const index = code.lastIndexOf(`.`);
    if (index === -1) return ret;

    code = code.slice(0, index);
    ret += ` OR ` + code;
  }
}

function getMaxLengthCodeInSource(frees) {
  let ret = frees[0];

  for (let item of frees) {
    if (item._source.code.length > ret._source.code.length) ret = item;
  }

  return ret._source;
}

function getMinLengthCodeInSource(locks) {
  let ret = locks[0];

  for (let item of locks) {
    if (item._source.code.length < ret._source.code.length) ret = item;
  }

  return ret._source;
}

const setting = {
  getDefaultSetting: async (key) => {
    const client = es.getESClient();
    const query = es.getQueryFilter({ key, domain: `default` });
    const body = await client.search({
      index: `setting`,
      body: { query },
    });

    if (body.hits.total === 0) return undefined;
    return body.hits.hits[0]._source;
  },
  setDefaultSetting: async (data) => {
    const { value, key } = data;
    const index = `setting`;
    const client = es.getESClient();

    await client.index({
      index,
      id: key,
      body: { code: ``, domain: `default`, value, grade: `free`, key: key },
    });
  },
  initSetting: async (data) => {
    const { value, key } = data;
    const index = `setting`;
    const client = es.getESClient();

    const query = es.getQueryFilter({ key, domain: `default` });
    const ret = await client.search({
      index: `setting`,
      body: { query },
    });

    if (ret.hits.total.value > 0) return;
    console.log(`怎么可能会发生重置setting的问题`);
    console.log(ret);

    await client.index({
      index,
      id: key,
      body: { code: ``, domain: `default`, value, grade: `free`, key: key },
    });
  },
  setSetting: async (code, domain, key, value, grade) => {
    const client = es.getESClient();
    const index = `setting`;
    //查找文档
    let id = ``;
    const body = { code, domain, key, value, grade };
    const query = {
      bool: {
        filter: [
          {
            query_string: {
              default_field: "code",
              query: code,
            },
          },
          {
            query_string: {
              default_field: "domain",
              query: domain,
            },
          },
          {
            query_string: {
              default_field: "key",
              query: key,
            },
          },
        ],
      },
    };

    const ret = await client.search({
      index,
      body: { query },
    });
    if (ret.hits.total > 1) {
      throw `设置数据错误 查询到多份唯一文档数据 code:${code} domain:${domain} key:${key}`;
    } else if (ret.hits.total === 1) {
      id = ret.hits.hits[0]._id;
    } else {
      id = await utils.getCode(`setting`, `st`, `long`);
    }

    await client.index({ index, type: `_doc`, id, body, refresh: true });
    return { ...body, id };
  },

  getSetting: async (code, domain, key) => {
    const client = es.getESClient();

    const index = `setting`;
    const codes = getCodeCondition(code);

    const getCustomerSetting = async () => {
      const query = es.getQueryFilter({ code: codes, domain, key });

      const body = await client.search({
        index,
        body: { query },
      });

      if (body.hits.total == 0) {
        return null;
      } else {
        const locks = body.hits.hits.filter(
          (item) => item._source.grade === `lock`
        );

        if (locks.length !== 0) {
          return getMinLengthCodeInSource(locks);
        }

        const frees = body.hits.hits.filter(
          (item) => item._source.grade === `free`
        );
        return getMaxLengthCodeInSource(frees);
      }
    };

    const getDefaultSetting = async () => {
      const ret = await client.get({
        index,
        id: key,
      });
      return ret.body._source;
    };

    let setting = null;
    try {
      setting = await getCustomerSetting();
    } catch (err) {
      throw `获取自定义配置时出现错误` + err;
    }
    try {
      if (!setting) setting = await getDefaultSetting();
    } catch (err) {
      throw `获取默认配置时出现错误` + err;
    }

    return setting;
  },
};

module.exports = setting;
