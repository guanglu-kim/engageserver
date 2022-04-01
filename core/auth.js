const moment = require(`moment`);
const jwt = require("jsonwebtoken");
const setting = require(`../util/setting`);

const createToken = async (_id, name) => {
  const setBase = await setting.getDefaultSetting(`base`);
  const expiresIn = setBase.value.token * 60;
  const expiresAt = moment().add(setBase.value.token, `minute`).valueOf();

  const token = jwt.sign(
    {
      _id,
      name,
    },
    `secret123`,
    { expiresIn }
  );

  return { token, expiresAt };
};

const createRefreshToken = async (_id) => {
  const setBase = await setting.getDefaultSetting(`base`);
  const expiresIn = setBase.value.refreshToken * 60;
  const expiresAt =
    moment().add(setBase.value.refreshToken, `minute`).valueOf() + expiresIn;
  const refreshToken = jwt.sign({ _id }, `secret123`, { expiresIn });
  return { refreshToken, expiresAt };
};

const decode = (token) => {
  return jwt.decode(token);
};

const analysUser = (ctx) => {
  return decode(ctx.request.header.authorization.split(" ")[1]);
};

module.exports = {
  createToken,
  createRefreshToken,
  decode,
  analysUser,
};
