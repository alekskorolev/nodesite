/*
*	Библиотека утилит для бизнес-логики
*/
var Url = require('url'),
qs = require('querystring');
// Генерация уникального кода
exports.generateUUID = function (){
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x7|0x8)).toString(16);
    });
    return uuid;
};

// Генерация пароля
exports.generatePASS = function (){
    var d = new Date().getTime();
    var pass = 'xxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (r).toString(16);
    });
    return pass;
};

exports.videoPars = function (urlList) {
    var parsedList = [];
    var that = this;
    // В случае одной приложенной ссылки приходит строка, преобразуем в массив
    if( typeof urlList === 'string' ) {
        urlList = [ urlList ];
    }
    if (urlList && urlList[0] && urlList) {
        urlList.forEach(function (url) {
            parsedList.push(exports.createUrl(Url.parse(url), true));
        });
    }
    return parsedList;
};

exports.createUrl = function (url) {
    // check youtube
    var newUrl;
    console.log("Я Тони Кетсвилл и сегодня мы попробуем преобразовать URL: ", url);
    url.query = qs.parse(url.query);
    console.log("Логическое выражение: ", url.host);
    if (url.host && url.host.indexOf('youtube')+1) {
        newUrl = "//www.youtube.com/embed/" + url.query.v;
    } else {
        newUrl = url;
    }
    console.log(url+" преобразован в "+newUrl);
    return newUrl;
}