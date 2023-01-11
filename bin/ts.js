#! /usr/bin/env node
const colors = require('colors');
const say = require('say');
const argv = require('yargs').argv,
  queryStr = encodeURI(argv._.join(' '));
//=======================================================
if (!queryStr) {
  //命令后没有参数
  console.log('这里是帮助文本');
  console.log('请输入单词或短句[-S,--say]');
} else {
  //有参数--say或-S,播放
  if (argv.say == true || argv.S == true) {
    console.log('播放中...'.rainbow);
    say.speak(queryStr);
    return;
  }
  //发送文本到有道api进行查词
  translate(queryStr);
}
//格式化
function format(json) {
  let data = JSON.parse(json),
    pronTitle = '发音：',
    pron = data.basic ? data.basic.phonetic : '无',
    mainTitle = '翻译：',
    mainTrans = '',
    webTitle = '网络释义：',
    machineTrans = '',
    webTrans = '',
    template = '';
  let basic = data.basic,
    web = data.web,
    translation = data.translation;
  if (basic ? basic : '') {
    for (let i = 0; i < basic.explains.length; i++) {
      mainTrans += '\n' + basic.explains[i];
    }
  }
  if (web ? web : '') {
    for (let i = 0; i < web.length; i++) {
      webTrans +=
        '\n' +
        (i + 1) +
        ': ' +
        web[i].key.red.bold +
        '\n' +
        web[i].value.join(',');
    }
  }
  translation ? (machineTrans = translation) : false;
  template =
    pronTitle.red.bold +
    pron +
    '\n' +
    mainTitle.green.bold +
    mainTrans +
    '\n' +
    webTitle.blue.bold +
    webTrans +
    '\n' +
    '机器翻译：'.green.bold +
    machineTrans;
  console.log(template);
}
//发送请求
function translate(query) {
  //发送翻译请求
  let http = require('http');
  // 1.用于请求的选项
  let options = {
    host: 'fanyi.youdao.com',
    port: '80',
    path:
      '/openapi.do?keyfrom=translation-tool&key=1730699468&type=data&doctype=json&version=1.1&q=' +
      query,
  };
  // let options = ` http://aidemo.youdao.com/trans?q=${query}&&from=Auto&&to=Auto`;
  // 处理响应的回调函数
  let callback = function (response) {
    // 不断更新数据
    response.on('data', function (data) {
      //对返回的数据进行格式化和高亮
      format(data);
    });
    response.on('end', function () {
      // 数据接收完成
      console.log('---------------');
    });
  };
  // 向服务端发送请求
  let req = http.request(options, callback);
  req.end();
}
