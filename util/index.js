const es = require(`./es`);
const moment = require(`moment`);

function send(
  ctx,
  success,
  data,
  errorCode,
  errorMessage,
  showType,
  traceId,
  host
) {
  ctx.body = {
    success: success,
    data: data,
    errorCode: errorCode,
    errorMessage: errorMessage,
    showType: showType,
    traceId: traceId,
    host: host,
  };
  if (!ctx.body.data) ctx.body.data = {};
}

function padLeft(num, width) {
  let ret = `` + num;
  if (ret.length >= width) {
    return ret;
  } else {
    return (Array(width).join(`0`) + ret).slice(-width);
  }
}

module.exports = {
  error: (stage, error, res = null, ei = null) => {
    const message = error.toString();

    if (res)
      res.status(500).send({
        success: false,
        data: error,
        errorMessage: stage + message,
        ei,
      });
  },

  sendCode: (ctx, errorCode, errorMessage) => {
    ctx.status = 200;
    send(ctx, false, undefined, errorCode, errorMessage);
  },

  send200: (ctx, data) => {
    ctx.status = 200;
    send(ctx, true, data);
  },

  send504: (ctx, data) => {
    ctx.status = 504;
    send(ctx, false, data, 504, `事件中心发生错误`);
  },

  send400: (ctx, message) => {
    ctx.status = 400;
    send(ctx, false, undefined, 400, message);
  },

  send403: (ctx, message) => {
    ctx.status = 403;
    send(ctx, false, undefined, 403, message);
  },

  send404: (ctx, message) => {
    ctx.status = 404;
    send(ctx, false, undefined, 403, message);
  },

  getCode: async (domain, prefix, type, width) => {
    if (!prefix) {
      prefix = ``;
    }
    if (!width) {
      width = 4;
    }
    if (!type) {
      type = `long`;
    }

    const id = domain + prefix;
    const index = `code`;
    let flow = 0;
    let code = ``;

    //获取当前日期

    const moment = require("moment");
    const date = moment().utc().utcOffset(8).format("YYYYMMDD");

    //创建ES客户端
    const client = es.getESClient();

    //按照domain+prefix作为ID 判断文档是否存在

    try {
      let isExists = await client.exists({
        index,
        id,
      });

      if (!isExists) {
        //若不存在则创建一份文档

        await client.create({
          index,
          id: id,
          body: {
            flow,
            date,
          },
          refresh: true,
        });
      }
    } catch (err) {
      console.log(err);
      throw `判断code文档是否存在时出错`;
    }

    //获取文档 生成编码后更新文档

    try {
      console.log(id.toString());
      console.log(index);
      const body = await client.get({ index, id });

      flow = body._source.flow + 1;

      const { version } = body;

      if (type === `long`) {
        if (date !== body._source.date) {
          flow = 1;
        }
        code = prefix + date + padLeft(flow, width);
      } else {
        code = prefix + padLeft(flow, width);
      }

      //更新文档

      await client.index({
        id,
        index,
        version,
        body: {
          flow,
          date,
        },
        refresh: true,
      });

      //返回结果

      return code;
    } catch (err) {
      console.log(err);
      throw `生成编码时失败:` + err;
    }
  },

  getCurrentDate() {
    const moment = require("moment");
    const date = moment().format(`YYYY-MM-DD hh:mm:ss`);
    return date;
  },

  getInfiniteDate() {
    const moment = require("moment");
    const date = moment(`9999-12-30`).format(`YYYY-MM-DD hh:mm:ss`);
    return date;
  },

  getWeekDay(weekDay) {
    switch (weekDay) {
      case 0:
        return `六`;
      case 1:
        return `日`;
      case 2:
        return `一`;
      case 3:
        return `二`;
      case 4:
        return `三`;
      case 5:
        return `四`;
      case 6:
        return `五`;
    }
  },

  // 身份证计算年龄和性别

  analyzeIDCard(user) {
    var IDCard = user.idCard;
    var sexAndAge = {};

    //获取用户身份证号码

    var userCard = IDCard;

    //如果身份证号码为undefind则返回空

    if (!userCard) {
      return sexAndAge;
    }

    //获取性别

    if (parseInt(userCard.substr(16, 1)) % 2 == 1) {
      sexAndAge.sex = "男";
    } else {
      sexAndAge.sex = "女";
    }

    //获取出生年月日

    birth =
      userCard.substring(6, 10) +
      "-" +
      userCard.substring(10, 12) +
      "-" +
      userCard.substring(12, 14);
    sexAndAge.birth = birth;
    var yearBirth = userCard.substring(6, 10);
    var monthBirth = userCard.substring(10, 12);
    var dayBirth = userCard.substring(12, 14);

    //获取当前年月日并计算年龄

    var myDate = new Date();
    var monthNow = myDate.getMonth() + 1;
    var dayNow = myDate.getDay();
    var age = myDate.getFullYear() - yearBirth;

    if (
      monthNow < monthBirth ||
      (monthNow == monthBirth && dayNow < dayBirth)
    ) {
      age--;
    }

    //得到年龄

    sexAndAge.age = age;

    //返回数据

    user.idCard =
      IDCard.substring(0, 5) + "*********" + IDCard.substring(14, 18);
    user.gender = sexAndAge.sex;
    user.birth = new Date(sexAndAge.birth).getTime();
    user.age = sexAndAge.age;
    return user;
  },

  sqlfliter: (data) => {
    let obj = typeof data == "object" ? data : JSON.parse(data);

    Object.keys(obj).forEach((item) => {
      if (/keyword/i.test(item)) {
        if (!obj[item] || typeof obj[item] != "string") {
          return;
        }

        const i =
          /select|update|delete|truncate|join|union|exec|insert|drop|count|'|"|;|>|<|%/gi;
        obj[item] = obj[item].replace(i, "");
      }
    });

    return obj;
  },

  //json深拷贝

  cloneJson: (json) => {
    var temp = JSON.stringify(json);
    return JSON.parse(temp);
  },

  //获取当前时间戳

  getTimeStamp: () => {
    return moment().valueOf();
  },

  // 计算请假时长 当前时间到晚上00点

  leaveDayHours: (t0) => {
    //当天是否为假期

    const week = moment(t0).startOf(`day`).valueOf().day();

    if (week == 0 || week == 6) return 0;

    const h = moment(t0).hours();
    const m = moment(t0).minutes();
    var long = 0;

    if (h < 8) {
      long = 7.5;
    }
    if (h == 8 && m <= 30) {
      long = 7.5;
    }
    if (h == 8 && m > 30) {
      long = 7.5 - ((m - 30) / 60).toFixed(2);
    }
    if (h > 8 && h < 11) {
      long = 11 - h + 0.5 - (m / 60).toFixed(2) + 4.5;
    }
    if (h == 11 && m <= 30) {
      long = ((30 - m) / 60).toFixed(2) + 4.5;
    }

    if (h == 11 && m > 30) {
      long = 4.5;
    }

    if (h > 11 && h < 13) {
      long = 4.5;
    }

    if (h >= 13 && h <= 16) {
      long = 17 - h - (m / 60).toFixed(2) + 0.5;
    }

    if (h == 17 && m <= 30) {
      long = ((30 - m) / 60).toFixed(2);
    }

    if (h == 17 && m > 30) {
      long = 0;
    }

    return long;
  },
};
