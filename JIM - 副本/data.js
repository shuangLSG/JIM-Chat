// jim返回数据
sendPic={
    "content":{
        "version":1,
        "target_type":"single",
        "from_platform":"web",
        "target_id":"xuqijin110",
        "from_id":"lsg222",
        "create_time":1545890623707,
        "msg_type":"image",
        "msg_body":{
            "media_id":"qiniu/image/j/9C099AD7344FD5D486832D08EC5D2505.jpg",
            "media_crc32":2180020089,
            "width":1024,
            "height":768,
            "format":"jpg",
            "fsize":879394
        },
        "target_appkey":"5244aea56672ae685d799270",
        "from_appkey":"4f7aef34fb361292c566a1cd"
    },
    "no_offline":false,
    "no_notification":false,
    "need_receipt":true,
    "target_id":"xuqijin110",
    "appkey":"5244aea56672ae685d799270",
    "rid":882441590
}
// 自定义数据
msgs = {
    content: {
        from_id: "lsg222",
        msg_type: 'image',
        msg_body: {
            // media_url: value.src,
            "media_id":"qiniu/image/j/9C099AD7344FD5D486832D08EC5D2505.jpg",
            "media_crc32":2180020089,
            "width":1024,
            "height":768,
        }
    },
    ctime_ms: new Date().getTime(),
    success: 1,
    unread_count: 0,
    // msgKey: msgKey++,
};

onMsgReceive = {
    "sync_key": 1545028686332,
    "messages": [{
        "msgs": [{
            "ctime_ms": 1542867683916,
            "msg_type": 3,
            "need_receipt": true,
            "custom_notification": {
                "alert": "",
                "at_prefix": "",
                "title": "",
                "enabled": false
            },
            "msg_id": 2052246505,
            "msg_level": 0,
            "content": {
                "from_type": "user",
                "from_id": "xuqijin110",
                "target_appkey": "4f7aef34fb361292c566a1cd",
                "set_from_name": 0,
                "create_time": 1542867685875,
                "target_name": "nickname",
                "from_appkey": "4f7aef34fb361292c566a1cd",
                "target_type": "single",
                "from_platform": "web",
                "target_id": "test0022",
                "sui_mtime": 1542779531,
                "from_name": "xuqijin_nick_name",
                "version": 1,
                "msg_body": {
                    "text": "12221"
                },
                "msg_type": "text"
            }
        }, {
            "ctime_ms": 1542867684015,
            "msg_type": 3,
            "need_receipt": true,
            "custom_notification": {
                "alert": "",
                "at_prefix": "",
                "title": "",
                "enabled": false
            },
            "msg_id": 2052246513,
            "msg_level": 0,
            "content": {
                "from_type": "user",
                "from_id": "xuqijin110",
                "target_appkey": "4f7aef34fb361292c566a1cd",
                "set_from_name": 0,
                "create_time": 1542867686034,
                "target_name": "nickname",
                "from_appkey": "4f7aef34fb361292c566a1cd",
                "target_type": "single",
                "from_platform": "web",
                "target_id": "test0022",
                "sui_mtime": 1542779531,
                "from_name": "xuqijin_nick_name",
                "version": 1,
                "msg_body": {
                    "text": "12221"
                },
                "msg_type": "text"
            }
        }]
    }]
}


var onSyncConversation = {
    msgs: {
        "ctime_ms": 1542867683916,
        "msg_type": 3,
        "need_receipt": true,
        "custom_notification": {
            "alert": "",
            "at_prefix": "",
            "title": "",
            "enabled": false
        },
        "msg_id": 2052246505,
        "msg_level": 0,
        "content": {
            "from_type": "user",
            "from_id": "xuqijin110",
            "target_appkey": "4f7aef34fb361292c566a1cd",
            "set_from_name": 0,
            "create_time": 1542867685875,
            "target_name": "nickname",
            "from_appkey": "4f7aef34fb361292c566a1cd",
            "target_type": "single",
            "from_platform": "web",
            "target_id": "test0022",
            "sui_mtime": 1542779531,
            "from_name": "xuqijin_nick_name",
            "version": 1,
            "msg_body": {
                "text": "12221"
            },
            "msg_type": "text"
        }
    }
}