// 会话列表
const now = new Date();
data = {
    sessions: [{
            id: 1,
            user: {
                name: '示例介绍',
                img: 'logo.png'
            },
            messages: [{
                content: 'Hello，这是一个基于Vue + Vuex + Webpack构建的简单chat示例，聊天记录保存在localStorge, 有什么问题可以通过Github Issue问我。',
                date: now
            }, {
                content: '项目地址: https://github.com/coffcer/vue-chat',
                date: now,
                self: true
            }]
        },
        {
            id: 2,
            user: {
                name: 'webpack',
                img: 'dist/images/3.jpg'
            },
            messages: []
        }
    ]
}



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