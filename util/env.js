module.exports = {
  init: () => {
    console.log("NODE_ENV: ", process.env.NODE_ENV);

    if (process.env.NODE_ENV == "prod") {
      process.env.ES_URL = `https://118.190.144.191:9200`;
      process.env.ES_USERNAME = `elastic`;
      process.env.ES_PASSWORD = `q5BjbX7se_30JO6OU6Bg`;
    } else if (process.env.NODE_ENV == "dev") {
      process.env.ES_URL = `https://192.168.0.90:9200`;
      process.env.ES_USERNAME = `elastic`;
      process.env.ES_PASSWORD = `0HsHbSxZXjdjZ8lG33q_`;
    } else if (process.env.NODE_ENV == "local") {
      process.env.ES_URL = `https://192.168.0.90:9200`;
      process.env.ES_USERNAME = `elastic`;
      process.env.ES_PASSWORD = `0HsHbSxZXjdjZ8lG33q_`; //  yZGOcUW*uhshUs-BxAm_
    } else {
      process.env.ES_URL = `https://192.168.0.90:9200`;
      process.env.ES_USERNAME = `elastic`;
      process.env.ES_PASSWORD = `0HsHbSxZXjdjZ8lG33q_`; //  yZGOcUW*uhshUs-BxAm_
    }
  },
};
