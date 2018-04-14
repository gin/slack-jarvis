const request = require('request');
const WebSocketClient = require('websocket').client;
let message = '';
let i = 0;
let latex = {};

const fs = require('fs');
fs.readFile('secret.txt','utf8',function (err, data) {
  global.token=data;
  global.token = global.token.replace(/[\n\r]/g,'');
  getWebSocket();
});

function getWebSocket() {
  request(`https://slack.com/api/rtm.start?token=${global.token}&pretty=1`, function (error, response, body) {
    //console.log(response.url);
    if (!error && response.statusCode == 200) {
      url = JSON.parse(body).url;
      console.log(`Creating url:${url}`);
      createWS(url);
    }
  });
}

function createWS(url) {
  let client = new WebSocketClient();

  client.on('connectFailed', function(error) {
    console.log('Connect Error:\n' + error.toString());
  });

  client.on('connect', function(connection) {
    console.log('WebSocket Client Connected');

    connection.on('error', function(error) {
      console.log('Connection Error:\n' + error.toString());
    });

    connection.on('close', function() {
      console.log('echo-protocol Connection Closed');
    });

    connection.on('message', function(message) {
      if (message.type === 'utf8') {
        handleMessage(JSON.parse(message.utf8Data));
      }
    });
  });
  client.connect(url);
  console.log('hey?');
}

function deleteMessage(timestamp,channel) {
  let dURL = `https://slack.com/api/chat.delete?token=${global.token}&ts=${timestamp}&channel=${channel}&pretty=1`;

  request(dURL, function (error, response, body) {
    //console.log(response.url);
    if (!error && response.statusCode == 200) {
      console.log(body);
    }
  });
}

function postLatex(channel,text) {
  let urlBase= `http://latex.codecogs.com/png.latex?%5Cdpi%7B300%7D%20${encodeURIComponent(text)}`;
  let dURL = `https://slack.com/api/chat.postMessage?token=${global.token}&channel=${channel}&text=%20&attachments=%5B%7B%22fallback%22%3A%22.%22%2C%22color%22%3A%20%22%2336a64f%22%2C%22image_url%22%3A%22${encodeURIComponent(urlBase)}%22%7D%5D&pretty=1`;

  request(dURL, function (error, response, body) {
    //console.log(response.url);
    if (!error && response.statusCode == 200) {
      console.log(body);
    }
  });
}


function handleMessage(mObj) {
  console.log(`Received:\t${JSON.stringify(mObj)}`);
  console.log(`Message type:\t${mObj.type}`);

  if (mObj.type==='message') {

    console.log(`Channel:\t${mObj.channel}`);
    console.log(`User:\t\t${mObj.user}`);
    console.log(`Text:\t\t${mObj.text}`);
    console.log(`Escaped Text:\t${escape(mObj.text)}`);

    if (mObj.text === '..ping') {
      pong(mObj.channel,'pong');
    }

    if (latex[mObj.user+mObj.channel] == true &&
        mObj.text[0] === '$' &&
        mObj.text[mObj.text.length-1] === '$' &&
        mObj.text.length > 1)
    {
      deleteMessage(mObj.ts, mObj.channel);
      postLatex(mObj.channel, replaceAll(mObj.text.substring(1, mObj.text.length-1), '&amp;', '&'));
      console.log(`Converting to latex:\t${mObj.text}`);
    }

    if (mObj.text === '..startLatex') {
      latex[mObj.user+mObj.channel] = true;
      console.log(`Enable latex for:\t${mObj.user}\t${mObj.channel}`);
    }

    if (mObj.text === '..stopLatex') {
      latex[mObj.user+mObj.channel] = false;
      console.log(`Disable latex for:\t${mObj.user}\t${mObj.channel}`);
    }
  }
}

function pong(channel, text) {
  let message2send = {};
  message2send.text = text;
  message2send.channel = channel;
  message2send.id = i;
  message2send.type = 'message';
  console.log(JSON.stringify(message2send, null, 4));
  i+=1;
  return i;
}

function escapeRegExp(str) {
  return str.replace(/([.*+?^=!:${}()|[]\/\])/g, '\$1');
}

function replaceAll(str, find, replace) {
  return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

