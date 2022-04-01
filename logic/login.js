const event = require(`../core/event`);
const es = require(`../util/es`);
const coreAuth = require(`../core/auth`);
const moment = require(`moment`);

const index = `login`;

async function init() {
  event.sub(index, `${index}`, async (payload) => {
    const { account, password } = payload.value;
    const client = es.getESClient();
    const index = `account`;
    const query = es.getQueryFilter({ account, password });
    const { hits } = await client.search({ index, body: { query } });
    if (hits.total.value == 0) {
      return {
        deny: true,
        message: `用户不存在或密码错误`,
      };
    }

    const user = hits.hits[0]._source;

    const token = await coreAuth.createToken(user.id, user.name);
    const refreshToken = await coreAuth.createRefreshToken(user.id);

    const data = {
      user: { ...user, password: undefined },
      token,
      refreshToken,
    };

    const extra = {
      user: user.data,
    };

    return {
      data,
      extra,
    };
  });

  event.sub(index, `${index}.refreshToken`, async (payload) => {
    const { refreshToken } = payload.value;

    const data = coreAuth.decode(refreshToken);
    
    if (moment().unix() > data.exp) return { data: { code: 1 } };

    const { _id } = data;
    const user = await es.get(`account`, _id);

    if (!user) return { data: { code: 2 } };

    const token = await coreAuth.createToken(user.id, user.name);
    const refreshTokenData = await coreAuth.createRefreshToken(user.id);

    return {
      data: {
        code: 0,
        user: { id: user.id, name: user.name },
        token,
        refreshToken: refreshTokenData,
      },
    };
  });
}

async function initData() {}

module.exports = {
  init,
  initData,
};
