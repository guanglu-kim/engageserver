let es_client = null;
const fs = require(`fs`);
function getESClient() {
  if (es_client) return es_client;
  let elasticsearch = require("@elastic/elasticsearch");
  let client = new elasticsearch.Client({
    node: process.env.ES_URL,
    auth: {
      username: process.env.ES_USERNAME,
      password: process.env.ES_PASSWORD,
    },

    tls: {
      ca: getCAFingerprint(),
      rejectUnauthorized: false,
    },
  });
  es_client = client;
  return client;
}

function getCAFingerprint() {
  if (process.NODE_ENV == `prod`)
    return `MIIFWTCCA0GgAwIBAgIUQMsjejfjtINUSPsvTNK4Ajt4S9swDQYJKoZIhvcNAQEL
  BQAwPDE6MDgGA1UEAxMxRWxhc3RpY3NlYXJjaCBzZWN1cml0eSBhdXRvLWNvbmZp
  Z3VyYXRpb24gSFRUUCBDQTAeFw0yMjA0MDExMDI1MTZaFw0yNTAzMzExMDI1MTZa
  MDwxOjA4BgNVBAMTMUVsYXN0aWNzZWFyY2ggc2VjdXJpdHkgYXV0by1jb25maWd1
  cmF0aW9uIEhUVFAgQ0EwggIiMA0GCSqGSIb3DQEBAQUAA4ICDwAwggIKAoICAQCP
  zcST+TPOhyNDzOwWL3AvSVm+M4st6dWcOUUJk+opU9Ckf3igZzCVGdMy7ZizJJLx
  +a+mJeZ7hIAzyhABF65qyXMo2S6lVeD1nGhIGs4A1iiY3rfhN74TOxlvdQq9Zebc
  Cu61fgTGymtYIoYNL20aym54w8KovIyGDUpBH2Z3Qoak2oVgN6SjHBn6wAQXy385
  I/Mjj74FkSRJ1N3uGKW7of6FT4bmOC92vlQ2/3Q+hifGqgAcIzEKXXlcXsMvGqOf
  +n2NMug38z+fANRIt0WYg2Wo8HLlAyDqYbgHVcHGz2ugAZTCsp2Qi/cVDDhuSlLL
  kO/dj+F+q5EdxZ2M9m79Tw5E9n0ktucHwfMfL6/lva52ryjKHw6PbTnsogiVSQmj
  a2mFhN3fmTL2WVjBAeqtK3MS7qGhrWtIaY//gJOUly7jTN/ACQDuraDqTZO8s/w+
  HY4sSD4q4imU79uqMz+OKgNdqzeiKJ/Rq2/kQpnQ4J1NDRqD/mSbQoadfYxZrCgb
  rJyMXY4/+Rw9rjp2RhDSds6gWxYy54BbRvDl3WpWrhAUUYM4Z4MIDtKod1Bl9rcB
  4NMWTqJ70aujJhIikO0mXOHS03zagBgESjNtaCgVWHR8mfdD7ryX+wiW/T5cVwyh
  ragjc4I1d8wSZn5BxuqAmrsP8ROR4kbdC+arFEY9SwIDAQABo1MwUTAdBgNVHQ4E
  FgQUOGSx4UVewU4aRyHm4Z8G2CbEbS4wHwYDVR0jBBgwFoAUOGSx4UVewU4aRyHm
  4Z8G2CbEbS4wDwYDVR0TAQH/BAUwAwEB/zANBgkqhkiG9w0BAQsFAAOCAgEAYFf8
  3OBTivvG6VakJSl+L9Jj9PMP6wWQnWYlwUnAgbARR5n9dL8eR+TsxNgadLkIu0no
  bGWkmULObtEm+qsiNNip9UjM10fmKp0HhhU9l6WhPxPG4+EUN3xow0g6VIdruCSe
  2d+jjgkopUbwVc4Ia0JdPOaWVtr6IUUNLNlTymVsgRpq6qZjrpgcJinteeGRIBAy
  RzDfhdBG7fIrNKu6mAnhQAN9btObJ4Ic88wTrjeeAMpdpAM47YZWAIffjeL7lBu1
  Qf3P199z5TheuzV9luq++eSZHIVMaJKp52lOT2TaCLr6xzfql6BxBpIRogjJXJjP
  ElmAkI0Ph5aFhgloX2MGyi5eu7ST0QdEmAn3N11UP5X/qAnVhZBTJoPCqwovCpZ5
  +vT4aVAr0uTo8KHBRP1rPAquRmtzG6ON+WvH+KgHQAO+D1Cp6nh9FktfR4k1YVOy
  W8I1cfIutJQrvQK0ps0VcQWlobhcWBBbSNKeqqMdNH3GosBIMXqCc/TTkiXbo1k1
  agFS8viMxJB27bNicUDtgZpOvs7LRsCpmpd7YBAfbbAU0onXS+yq63AtxTMSvWU3
  Iwgfv4QzlmK4trqb21vGieuRTcu9sOY5qottKuMPb8T3Xv8ZSCGg+bsq50Ify2Hk
  nE3L0qPOmmL1czjEoOPXplxU85fGhojXK8A9QLs=`;
  else
    return `MIIFWTCCA0GgAwIBAgIUQbiMiurIzCoLIyirhZgxVq3DUJMwDQYJKoZIhvcNAQEL
  BQAwPDE6MDgGA1UEAxMxRWxhc3RpY3NlYXJjaCBzZWN1cml0eSBhdXRvLWNvbmZp
  Z3VyYXRpb24gSFRUUCBDQTAeFw0yMjAzMTkwNjAyMDFaFw0yNTAzMTgwNjAyMDFa
  MDwxOjA4BgNVBAMTMUVsYXN0aWNzZWFyY2ggc2VjdXJpdHkgYXV0by1jb25maWd1
  cmF0aW9uIEhUVFAgQ0EwggIiMA0GCSqGSIb3DQEBAQUAA4ICDwAwggIKAoICAQDS
  peC8KOBF33XGa7WLtDoZFzuBbZUOB6UkgCh0Y44WK4M8ckjB5GPkigiZlR34EuzX
  T4x3sttLTj18SSl/NNce5mQicWU9UU8T5NpK+l7aeH06dnsxRJd5meFyRj1GdTBP
  tYtW56WNbH7wN2PYwnbufoRE6y/l90HrWmfThxCUo+xVsYRWxb68bdLk0vbsHZM8
  aCQqgAKqzVYL90/tSyuXZTgKvMeF5v7JkcF0iqIr8+TYgVxsDM71/J+wBg0KQqZ0
  dnQtZpG+W/jLDWJVCHTiwovo94+S5yuidutqPNtrTzz0/PtYFKq4Op3McUmDYVqp
  fk3sq1MdStbvr8Rrlbx+m4L1z3CCBqJzzv0MOvLSdLzdWSUcIIpwmuVSAoFmYtvy
  /6OMX6Or4WIDDo8IU411hpOXwFp84LCv7mSfMCmtrKm93Mcc5ls32yIV7ALo3mAC
  SNzHwi5Vt+i5iWRLlSToTH+R+S9C6rfymq3mHeDj0LuA99ZKJJsjGn87VIZsq9Km
  0Z/01Vc7nCDuhOyNkQ3M3pNNjLOY+yoWDEOPINkcylfI9cWkditfjtMgyA3bTg0o
  wlOOy8befQbN44Z3ScVaCLFqj9D34gawJhMAHLODaJ8i3QBfFvqw/aEDMGVOnufj
  ufZvBOUfvEC5coHgnpF092CTYs1h/4Imn9WFJuw8WQIDAQABo1MwUTAdBgNVHQ4E
  FgQUceBVjvjMrkj3A/EVU5j2bOZglm0wHwYDVR0jBBgwFoAUceBVjvjMrkj3A/EV
  U5j2bOZglm0wDwYDVR0TAQH/BAUwAwEB/zANBgkqhkiG9w0BAQsFAAOCAgEAm2bC
  3l8Bt9yAmTVvAyba/Wkwo42Be+h+jKV3zhoFpdRhEyvvBAFS/90+gho1XmjvbSNX
  9BNjca2LPYuwJ3nAYoGHzJqoRtjWNuciSxS5qSnuFU7p0EmIwq9evYhzwBhD5Vzi
  3wOYeLO5uEfP6PGlgjKuR1TA+nst+GKB6OQ9O/7vtniQlxNakUaZJWpzAARsBa94
  C/23zWArligUvsILLgX2J1xOli03eHP/e1gy9tZufKAL0CyPrQlqtUYZkpPJ9UfU
  xwDIzR5fM2yjQQjRglW1i63nQlU8I7hLG1kKVKNTil3ER/AUSfWWHtbKceRubsyo
  SH9brZPHhUfwJDfIFiYK36dbZr/WRbzQ4rGSG1AVve+knG2Umm28+t+np+qrpY0/
  1kez8cz1GZbgsUD7uKCWrsCwHEF33LrJxGic4lU/qRr5xROPwoTqv7/154avySRc
  s76FUvnq/+Jg9GGiUPI+ODswphupodTopts+DfQxSGtOGFAK5JoMnOLkKDJvYCE1
  AOxE2DKjv1n3BSCI5hlVtKKjMzcnir8mmKK+ezqucPdQOb5yiaTH8zRDsuI5wHzF
  P8eB4FPUgY4Jri3zxgZf22MCFcAKpYoJPiAo6jCfZWPMLzmwIiEdxz2fXma5F88s
  oNYJBhQslfbEK3kWmyMCkUWp0b1kXgV3D2UbOE8=
  `;
}

function getQueryFilter(condition) {
  const lodash = require(`lodash`);
  const filter = [];
  lodash.mapKeys(condition, (value, key) => {
    if (value) {
      filter.push({ query_string: { fields: [key], query: value } });
    }
  });
  const query = { bool: { filter } };
  return query;
}

function getBoolFilter(list) {
  const lodash = require(`lodash`);
  const query = { bool: {} };
  lodash.map(list, (v, k) => {
    query.bool[k] = lodash.map(v, (v0, k0) => {
      return {
        query_string: {
          default_field: k0,
          query: v0,
        },
      };
    });
  });

  return query;
}

function getSortFilter(condition) {
  const lodash = require(`lodash`);
  const sort = [];
  lodash.mapKeys(condition, (value, key) => {
    let item = {};
    item[key] = { order: value };
    sort.push(item);
  });

  return sort;
}

function getAggs(condition) {
  const lodash = require(`lodash`);
  const ret = {};
  lodash.mapKeys(condition, (value, key) => {
    ret[key] = {
      sum: {
        field: value,
      },
    };
  });
  return ret;
}

async function initIndex(index, initData) {
  const client = getESClient();
  const exists = await client.indices.exists({ index });
  if (exists) return;

  await client.indices.create({
    index,
    body: {
      settings: {
        number_of_shards: 1,
      },
      mappings: {
        dynamic_templates: [
          {
            strings: {
              match_mapping_type: `string`,
              mapping: {
                type: `keyword`,
              },
            },
          },
          {
            ids: {
              match: `id`,
              mapping: {
                type: `keyword`,
              },
            },
          },
        ],
        properties: {
          id: {
            type: `keyword`,
          },
        },
      },
    },
  });

  if (initData == undefined) return;
  const body = [];
  for (let data of initData) {
    body.push({ index: { _index: index, _id: data.id } });
    body.push(data);
    if (body.length % 100 == 1) {
      await client.bulk({ refresh: true, body });
      body.splice(0, body.length);
    }
  }
  await client.bulk({ refresh: true, body });
}

async function get(index, id) {
  const client = getESClient();

  try {
    const doc = await client.get({ index, id });
    return doc._source;
  } catch (err) {
    return undefined;
  }
}

async function index(index, doc) {
  const client = getESClient();
  await client.index({
    index,
    id: doc.id,
    body: doc,
    refresh: true,
  });
}

async function remove(index, id) {
  const client = getESClient();
  await client.delete({ index, id, refresh: true });
}

async function getByRid(index, rid, domain = undefined) {
  const client = getESClient();
  const query = getQueryFilter({ rid, domain });
  const { body } = await client.search({
    index,
    body: { query },
    size: 10000,
  });
  return body.hits.hits.flatMap((doc) => doc._source);
}

async function getDocs(index, query, sort) {
  const client = getESClient();
  const ret = await client.search({
    index,
    body: { query, sort },
    size: 10000,
  });
  for (let item of ret.hits.hits) {
    if (!item._source.id) item._source.id = item._id;
  }
  return ret.hits.hits.flatMap((doc) => doc._source);
}

async function getDocsByPage(index, query, sort, current, pageSize) {
  const from = (current - 1) * pageSize;
  const size = pageSize;
  const client = getESClient();
  const ret = await client.search({
    index,
    body: { query, sort },
    size,
    from,
  });
  return {
    total: ret.hits.total.value,
    list: ret.hits.hits.flatMap((doc) => doc._source),
  };
}

async function initData(index, doc) {
  const client = getESClient();

  const ret = await get(index, doc.id);
  if (ret) return;

  await client.index({
    index,
    id: doc.id,
    body: doc,
  });
}

module.exports = {
  getESClient,
  getQueryFilter,
  getSortFilter,
  getAggs,
  initIndex,
  get,
  index,
  remove,
  getByRid,
  getDocs,
  getDocsByPage,
  getBoolFilter,
  initData,
};
