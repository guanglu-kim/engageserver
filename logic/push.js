const { FORMERR } = require("dns");
const event = require(`../core/event`);
const es = require(`../util/es`);
const push = require(`../core/push`);

const index = `account_push_registerId`
async function init() {
    await es.initIndex(index);

    event.sub(index, `push.register`, async (payload) => {
        const { value } = payload;
        const { id, registerId } = value;
        const doc = await es.get(id, index);
        if (doc == undefined) {
            await es.index(index, { id, registerIds: [registerId] })
        } else {
            const find = doc.registerIds.find(f => f === registerId);
            if (!find) {
                doc.registerIds.add(registerId);
                await es.index(index, doc);
            }
        }
    });

    event.sub(index, `push.clean`, async (payload) => {
        const { value } = payload;
        const { id, registerId } = value;
        const doc = await es.get(id, index);
        if (doc) {
            const findIndex = doc.registerIds.findIndex(f => f === registerId);
            if (findIndex != -1) {
                doc.registerIds.splice(findIndex, 1);
                await es.index(index, doc);
            }
        }
    })

    event.sub(index, `push`, async (payload) => {
        const { value } = payload;
        const { id, message } = value;

        // 根据用户Id 查询[registerId] 发送消息
        const doc = await es.get(id,index);
        if(doc){
            for(let item of doc.registerIds){
                push.push(item,message);
            }
        }
    })


}

async function initData() {

}

module.exports = {
    init,
    initData,
};
