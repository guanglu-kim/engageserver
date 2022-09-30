const jpush = require('jpush-async')
const JPush = jpush.JPushAsync
console.log(JPush)

const client = JPush.buildClient(`f1394f3573ada14c674d1799`, `0531b6eaf64f8c9f794e34f3`)


const push = (registerId,message) => {
    client.push()
        .setPlatform(JPush.ALL)
        .setAudience(JPush.registration_id(registerId))
        .setNotification(message)
        .send()
        .then((res) => console.log(res))
        .catch((err) => console.log(err));
}

module.exports = {
    push,
};

