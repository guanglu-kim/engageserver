const event = require(`../core/event`);
const es = require(`../util/es`);
const coreAuth = require(`../core/auth`);
const moment = require(`moment`);
const push = require(`../util/push`);

const index = `engage`;

async function init() {
  await es.initIndex(index);
  event.sub(index, `${index}.post`, async (payload) => {
    const { value } = payload;
    await es.index(index, value);
  });

  event.sub(index, `${index}.delete`, async (payload) => {
    const { origin, value } = payload;

    if (origin.status == `confirm`) return { deny: true, message: `已生效` };

    await es.remove(index, value.id);
  });

  event.sub(index, `${index}.schedule`, async (payload) => {
    const { value } = payload;
    const data = await push.postToken();
    var once = true;

    for (let item of value) {
      const doc = await es.get(`engage`, item.id);

      if (once) {
        await push.send(JSON.parse(data).access_token, {
          topic: item.target.id,
          title: "您的日程已排期",
          msg: `${moment(item.confirm.start).format(`MM月DD日`)}`,
        });
        once = false;
      }

      // 状态发生变更 通知
      if (doc.status != item.status) {
        if (item.status == `confirm`) {
          await push.send(JSON.parse(data).access_token, {
            topic: item.creator.id,
            title: "您的预约已生效",
            msg: `预约 ${item.target.name} 时间 ${
              moment(item.confirm.start).format(`hh:mm`) +
              ` - ` +
              moment(item.confirm.end).format(`hh:mm`)
            }`,
          });
        } else {
          await push.send(JSON.parse(data).access_token, {
            topic: item.creator.id,
            title: "您的预约已失效",
            msg: `预约 ${item.target.name}`,
          });
        }
      } else if (item.status == `confirm`) {
        if (
          item.confirm.start != doc.confirm.start ||
          item.confirm.end != doc.confirm.end
        ) {
          await push.send(JSON.parse(data).access_token, {
            topic: item.creator.id,
            title: "您的预约时间已调整",
            msg: `预约 ${item.target.name} 时间 ${
              moment(item.confirm.start).format(`hh:mm`) +
              ` - ` +
              moment(item.confirm.end).format(`hh:mm`)
            }`,
          });
        }
      }

      if (item.status != `confirm`) item.status = `cancel`;
      await es.index(index, item);
    }
  });

  event.sub(index, `${index}.special`, async (payload) => {
    const { value } = payload;
    const { engages } = value;
    const reason = value.reason != `` ? reason : `特殊事件`;
    const data = await push.postToken();
    var once = true;

    for (let item of engages) {
      const doc = await es.get(`engage`, item.id);

      if (once) {
        await push.send(JSON.parse(data).access_token, {
          topic: item.target.id,
          title: "您的日程已排期",
          msg: `${moment(item.confirm.start).format(`MM月DD日`)}`,
        });
        once = false;
      }

      // 状态发生变更 通知
      if (doc.status != item.status) {
        if (item.status == `confirm`) {
          await push.send(JSON.parse(data).access_token, {
            topic: item.creator.id,
            title: "您的预约已生效",
            msg: `预约 ${item.target.name} 时间 ${
              moment(item.confirm.start).format(`hh:mm`) +
              ` - ` +
              moment(item.confirm.end).format(`hh:mm`)
            }`,
          });
        } else {
          await push.send(JSON.parse(data).access_token, {
            topic: item.creator.id,
            title: "您的预约已失效",
            msg: `预约 ${item.target.name}`,
          });
        }
      } else if (item.status == `confirm`) {
        if (
          item.confirm.start != doc.confirm.start ||
          item.confirm.end != doc.confirm.end
        ) {
          await push.send(JSON.parse(data).access_token, {
            topic: item.creator.id,
            title: "您的预约时间已调整",
            msg: `因${reason}您预约 ${item.target.name} 的时间调整为 ${
              moment(item.confirm.start).format(`hh:mm`) +
              ` - ` +
              moment(item.confirm.end).format(`hh:mm`)
            }`,
          });
        }
      }

      if (item.status != `confirm`) item.status = `cancel`;
      await es.index(index, item);
    }
  });
}

async function initData() {}

module.exports = {
  init,
  initData,
};
