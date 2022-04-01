const schedule = require("node-schedule");
const es = require(`./es`);
const moment = require(`moment`);

async function run() {
  const rule = new schedule.RecurrenceRule();
  rule.second = 40;

  schedule.scheduleJob(rule, async () => {
    const start = moment().valueOf();
    const end = moment().add(10, `minute`).valueOf();
    const query = es.getQueryFilter({ status: `confirm` });
    query.bool.filter.push({
      range: {
        "confirm.start": {
          gte: start,
          lt: end,
        },
      },
    });

    const docs = await es.getDocs(`engage`, query);

    for (let doc of docs) {
      if (doc.push == true) continue;
      await push.send(JSON.parse(data).access_token, {
        topic: item.creator.id,
        title: "预约提醒",
        msg: `10分钟后 预约领导 ${item.target.name} `,
      });

      await push.send(JSON.parse(data).access_token, {
        topic: item.creator.id,
        title: "接见提醒",
        msg: `10分钟后 接见 ${item.creator.name} `,
      });

      doc.push = true;
      await es.index(`engage`);
    }
  });
}

module.exports = {
  run,
};
