const schedule = require("node-schedule");
const es = require(`./es`);
const moment = require(`moment`);
const setting = require("./setting");
//const push = require(`../util/push`);
const event = require(`../core/event`);

async function run() {
  const rule = new schedule.RecurrenceRule();
  rule.second = 40;

  schedule.scheduleJob(rule, async () => {
    // 提醒10分钟内到期的预约
    {
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
      //const data = await push.postToken();
      for (let doc of docs) {
        if (doc.push == true) continue;
        await event.pub(`push`, { value: { id: doc.creator.id, msg: `10分钟后 预约 ${doc.target.name} ` } });
        await event.pub(`push`, { value: { id: doc.target.id, msg: `10分钟后 接见 ${doc.creator.name} ` } });
        // await push.send(JSON.parse(data).access_token, {
        //   topic: doc.creator.id,
        //   title: "预约提醒",
        //   msg: `10分钟后 预约 ${doc.target.name} `,
        // });

        // await push.send(JSON.parse(data).access_token, {
        //   topic: doc.target.id,
        //   title: "接见提醒",
        //   msg: `10分钟后 接见 ${doc.creator.name} `,
        // });

        doc.push = true;
        await es.index(`engage`, doc);
      }
    }

    // 删除超过配置要求时间的预约
    {
      const config = await setting.getDefaultSetting(`schedule`);
      const { value } = config;
      if (value == undefined || value.keepDays == undefined) {
        console.log(`未找到预约记录保留天数`, value);
        return;
      }

      const end = moment().add(-value.keepDays, `day`).valueOf();
      const query = {
        bool: {
          filter: [
            {
              range: {
                "confirm.start": {
                  lt: end,
                },
              },
            },
          ],
        },
      };

      const docs = await es.getDocs(`engage`, query);
      console.log(`准备删除记录`, docs);
      for (let doc of docs) {
        await es.remove(`engage`, doc.id);
      }
    }
  });
}

module.exports = {
  run,
};
