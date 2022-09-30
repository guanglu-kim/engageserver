module.exports = {
  init: () => {
    console.log("NODE_ENV: ", process.env.NODE_ENV);

    if (process.env.NODE_ENV == "prod") {
      process.env.ES_URL = `https://192.168.1.90:9210`;
      process.env.ES_USERNAME = `elastic`;
      process.env.ES_PASSWORD = `13_SKvIi4CEMU+4uE=Iz`;
    } else if (process.env.NODE_ENV == "dev") {
      process.env.ES_URL = `https://192.168.1.90:9210`;
      process.env.ES_USERNAME = `elastic`;
      process.env.ES_PASSWORD = `13_SKvIi4CEMU+4uE=Iz`;
    } else if (process.env.NODE_ENV == "local") {
      process.env.ES_URL = `https://192.168.1.90:9210`;
      process.env.ES_USERNAME = `elastic`;
      process.env.ES_PASSWORD = `13_SKvIi4CEMU+4uE=Iz`;
    } else {
      process.env.ES_URL = `https://192.168.1.90:9210`;
      process.env.ES_USERNAME = `elastic`;
      process.env.ES_PASSWORD = `13_SKvIi4CEMU+4uE=Iz`;
    }
  },
};
