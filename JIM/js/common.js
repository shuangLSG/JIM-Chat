template.defaults.imports.dateFormat = function (date, format) {
    date = new Date(date);
    var map = {
        "M": date.getMonth() + 1, //月份 
        "d": date.getDate(), //日 
        "h": date.getHours(), //小时 
        "m": date.getMinutes(), //分 
        "s": date.getSeconds(), //秒 
        "q": Math.floor((date.getMonth() + 3) / 3), //季度 
        "S": date.getMilliseconds() //毫秒 
    };
    format = format.replace(/([yMdhmsqS])+/g, function (all, t) {
        var v = map[t];
        if (v !== undefined) {
            if (all.length > 1) {
                v = '0' + v;
                v = v.substr(v.length - 2);
            }
            return v;
        } else if (t === 'y') {
            return (date.getFullYear() + '').substr(4 - all.length);
        }
        return all;
    });
    return format;
}
template.defaults.imports.timestamp = function (value) {
    return value * 1000
};

/*
template.defaults.imports.dateFormatType = function (date) {
    date = new Date(date);
    var map = {
            "M": date.getMonth() + 1, //月份 
            "d": date.getDate(), //日 
            "h": date.getHours(), //小时 
            "m": date.getMinutes(), //分 
            "s": date.getSeconds(), //秒 
            "q": Math.floor((date.getMonth() + 3) / 3), //季度 
            "S": date.getMilliseconds() //毫秒 
        },
        format = '';
    if (date.toDateString() === new Date().toDateString()) {
        format = 'hh:mm';
    } else {
        format = 'yyyy-MM-dd hh:mm'
    }
    format = format.replace(/([yMdhmsqS])+/g, function (all, t) {
        var v = map[t];
        if (v !== undefined) {
            if (all.length > 1) {
                v = '0' + v;
                v = v.substr(v.length - 2);
            }
            return v;
        } else if (t === 'y') {
            return (date.getFullYear() + '').substr(4 - all.length);
        }
        return all;
    });

    return format;
};*/
template.defaults.imports.showContent = function (value) {
    return value.msg_body.text
};











function dateFormat(date, format) {
    date = new Date(date);
    var map = {
        "M": date.getMonth() + 1, //月份 
        "d": date.getDate(), //日 
        "h": date.getHours(), //小时 
        "m": date.getMinutes(), //分 
        "s": date.getSeconds(), //秒 
        "q": Math.floor((date.getMonth() + 3) / 3), //季度 
        "S": date.getMilliseconds() //毫秒 
    };
    format = format.replace(/([yMdhmsqS])+/g, function (all, t) {
        var v = map[t];
        if (v !== undefined) {
            if (all.length > 1) {
                v = '0' + v;
                v = v.substr(v.length - 2);
            }
            return v;
        } else if (t === 'y') {
            return (date.getFullYear() + '').substr(4 - all.length);
        }
        return all;
    });
    return format;
}
function showTime(msgTime) {
    const time = new Date(msgTime);
    const now = new Date();
    const msgYear = time.getFullYear();
    const nowYear = now.getFullYear();
    const nowHour = now.getHours();
    const nowMinute = now.getMinutes();
    const nowSecond = now.getSeconds();
    const nowTime = now.getTime();
    const todayTime = nowHour * 60 * 1000 * 60 + nowMinute * 1000 * 60 + nowSecond * 1000;
    const gapDate = (nowTime - todayTime - msgTime) / 1000 / 60 / 60 / 24;
    let showTime = '';
    if (msgYear !== nowYear) {
        showTime = 'year';
    } else if (gapDate > 6) {
        showTime = 'month';
    } else if (gapDate <= 6 && gapDate > 2) {
        showTime = 'day';
    } else if (gapDate <= 2 && gapDate > 1) {
        showTime = 'the day before';
    } else if (gapDate <= 1 && gapDate > 0) {
        showTime = 'yesterday';
    } else if (gapDate <= 0) {
        showTime = 'today';
    }
    return showTime;
}

