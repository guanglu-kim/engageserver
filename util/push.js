const https = require("https");
const iconv = require("iconv-lite");
var fs = require('fs');
var qs = require('querystring');

const postToken = async () => {
  var promise = new Promise(function (resolve, reject) {
    
    var options = {
      'method': 'POST',
      'hostname': 'oauth-login.cloud.huawei.com',
      'path': '/oauth2/v3/token',
      'headers': {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      'maxRedirects': 20
    };
    
    var req = https.request(options, function (res) {
      var chunks = [];
    
      res.on("data", function (chunk) {
        chunks.push(chunk);
      });
    
      res.on("end", function (chunk) {
        var body = Buffer.concat(chunks);
        console.log('body ',body.toString());
        resolve(body);
      });
    
      res.on("error", function (error) {
        console.error(error);
      });
    });
    
    var postData = qs.stringify({
      'grant_type': 'client_credentials',
      'client_id': '105847445',
      'client_secret': '2dfa506c8d9db418b1223b0532323b20046f50e10bbad2e32c00e951900e32d5'
    });

    req.write(postData);
    req.end();
  });

  return promise;
};

const send = async (token,payload) => {
  const {topic,title,msg} = payload;
    var promise = new Promise(function (resolve, reject) {

      let notification = {
        title: title ? title:"您有一条新消息",
        body: "点击查看详情"
    }
        let androidNotification = {
            title: title ? title : "您有一条新消息",
            body: msg ? msg : "点击查看详情",
            click_action: {
                type: 3,
            },

            style: 1,
            big_title: title ? title : "您有一条新消息",
            big_body: msg ? msg : "点击查看详情",
            
        }
        let androidConfig = {
            collapse_key: -1,
            urgency:"HIGH",
            ttl: "10000s",
            bi_tag: "the_sample_bi_tag_for_receipt_service",
            notification: androidNotification
        }
        let message = {
            notification: notification,
            android:androidConfig,
            topic: topic
        };  

      var options = {
        'method': 'POST',
        'hostname': 'push-api.cloud.huawei.com',
        'path': '/v1/105847445/messages:send',
        'headers': {
          'Content-Type': 'application/json; charset=UTF-8',
          'Authorization': `Bearer ${token}`
        },
      };
      
      var req = https.request(options, function (res) {
        var chunks = [];
      
        res.on("data", function (chunk) {
          chunks.push(chunk);
        });
      
        res.on("end", function (chunk) {
          var body = Buffer.concat(chunks);
          console.log('body ',body.toString());
          resolve(body);
  
        });
      
        res.on("error", function (error) {
          console.error(error);
        });
      });
      
      var postData ={
        'message': message,
      };

      req.write(JSON.stringify(postData));
      req.end();
    });
  
    return promise;
  };

module.exports = {
    postToken,
    send
}