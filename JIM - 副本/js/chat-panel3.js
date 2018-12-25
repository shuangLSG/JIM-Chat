$(function () {
    (function (mui, $) {

        /** ============== mui ==================*/
        mui.init({
            swipeBack: false, //启用右滑关闭功能
        });
        var scroll = mui('.mui-scroll-wrapper').scroll({
            bounce: false //是否启用回弹
        });

        function scrollBottom() {
            mui('.mui-scroll-wrapper').scroll().reLayout();
            mui('.mui-scroll-wrapper').scroll().scrollToBottom(100);
        }

        function createSelfMsgDom(msg) {
            // 添加字段 ctime_ms
            msg.ctime_ms = msg.content.create_time;
            // 刷新页面
            $('.message ul').append(template('singlemsg', msg));
            // 清空 input
            $('.action textarea').val('');
            scrollBottom(); // 滚动到底部
        }


        /** =================================== 
                           JIM
        ======================================*/
        window.JIM = new JMessage({
            debug: true
        });
        var global = {
            username: "xuqijin110",
            password: '123456',
            media_id: 'http://image.bfy100.com/1541670828jpeg',
            nickname: 'supvp.'
        }
        var targetUser = {
            across_user: 'test0022',
            across_appkey: '4f7aef34fb361292c566a1cd'
        }

        var appkey = '5244aea56672ae685d799270';
        var userInfo = null;

        init();

        // 初始化状态成功后 再进行后续操作
        setTimeout(function () {
            if (JIM.isInit()) {
                register();
            }
        }, 1000)
        setTimeout(function () {
            if (JIM.isInit() && !JIM.isLogin()) {
                login();
            }
        }, 1000)

        function init() {
            JIM.init({
                "appkey": '4f7aef34fb361292c566a1cd',
                "random_str": "404",
                "signature": '7db047a67a9d7293850ac69d14cc82bf',
                "timestamp": 1507882399401,
                "flag": 1

            }).onSuccess(function (data) {
                console.log('init success:----------------------------------')
                console.log(data);
            }).onFail(function (data) {
                console.log('error:' + JSON.stringify(data))
            });
        }

        function register() {
            JIM.register({
                ...global,

            }).onSuccess(function (data) {
                console.log('注册 success:----------------------------------')
                console.log(data);
            });
        }






        // 获取用户信息
        function getSelfInfo(username) {
            JIM.getUserInfo({
                username: global.username
            }).onSuccess(function (data) {
                userObj = data;
            }).onFail(function (data) {
                console.log(data);
            });
            return userObj;
        }
        // 创建单聊
        function createSingleChatAction() {
            JIM.getUserInfo({
                username: global.username
            }).onSuccess(function (data) {
                console.log(data);

                const user = data.user_info;
                const item = {
                    avatar: user.avatar,
                    mtime: user.mtime,
                    name: user.username,
                    nickName: user.nickname,
                    username: user.username,
                    nickname: user.nickname,
                    type: 3,
                    signature: user.signature,
                    gender: user.gender,
                    region: user.region,
                    avatarUrl: '',
                    // infoType: info.type
                };
                if (item.avatar !== '') {
                    const urlObj = {
                        media_id: data.user_info.avatar
                    };
                    JIM.getResource({
                        ...urlObj
                    }).onSuccess(function (data) {
                        if (data.code) {
                            item.avatarUrl = '';
                        } else {
                            item.avatarUrl = data.url;
                        }
                    })
                }

            }).onFail(function (data) {
                console.log(data);
            });
        }
        // 获取自己目前所在的群聊列表
        function selfChatrooms(username) {
            JIM.getSelfChatrooms({
                username: global.username
            }).onSuccess(function (data) {
                console.log(data);
            }).onFail(function (data) {
                console.log(data);
            });
        }
        // 同步自己发送的消息
        function receiveMessage(username) {
            JIM.syncReceiveMessage({
                username: global.username
            }).onSuccess(function (data) {
                console.log(data);
            }).onFail(function (data) {
                console.log(data);
            });
        }
        var isLoaded = false;
        // 监听在线事件消息
        function onEventNotification(username) {
            JIM.onEventNotification().onSuccess(function (data) {
                data.isOffline = false;
                if (!isLoaded) {
                    this.eventArr.push(data);
                }
            }).onFail(function (data) {
                console.log(data);
            });
        }

        // 发送新消息
        function sendSingleMsg(oTarget) {
            var content = $('.action textarea').val();
            JIM.sendSingleMsg({
                'target_username': targetUser.across_user,
                'appkey': targetUser.across_appkey,
                'content': content,
                'no_offline': false,
                'no_notification': false,
                need_receipt: true
            }).onSuccess(function (data, msg) {
                createSelfMsgDom(msg)

                console.log(data);
                console.log(msg);
            }).onFail(function (data) {
                console.log('error:' + JSON.stringify(data));
            });
        }
        var isMySelf = false;
        // 收到新消息
        function receiveNewMessage(data) {
            if (data.messages[0].content.from_id === global.user) {
                isMySelf = true;
                return;
            } else {
                isMySelf = false;
            }
        }



        function login() {
            JIM.login({
                ...global
            }).onSuccess(function (data) {
                console.log('login success:----------------------------------')
                // console.log(apiService.getUserInfo(global))
                // 创建单聊
                createSingleChatAction();

                // 获取用户信息


                // 修改个人信息



                // 聊天消息实时监听
                JIM.onMsgReceive(function (data) {
                    console.log(
                        'onMsgReceive接受消息:----------------------------------')
                    receiveNewMessage(data);
                });
                // 接受离线消息
                JIM.onSyncConversation(function (data) {
                    console.log(
                        'onSyncConversation接受离线消息:----------------------------------'
                    )
                    console.log(data)

                    var activePerson = null;
                    var activePersonName = "lingou19";
                    data.forEach(item => {
                        if (item.from_username == activePersonName) {
                            activePerson = item;
                        }
                    });
                    var json = {
                        msgs: activePerson.msgs,
                    }
                    // 获取这个人的信息
                    JIM.getUserInfo({
                        username: activePersonName
                    }).onSuccess(function (data) {
                        json.user_info = data.user_info;
                        json.global = global;
                    }).onFail(function (data) {
                        console.log(data);
                    });
                       
                   
                    
                    console.log(activePerson.msgs)
                    $('.message').append(template('test', json));
                    scrollBottom(); // 滚动到底部
                })
                // 发送信息
                document.querySelector('.action').addEventListener('tap', function (e) {
                    var oTarget = e.target;
                    if (oTarget.id == 'test-send') {
                        sendSingleMsg();
                    }
                })

                // 同步自己发送的消息
                // receiveMessage()
                // 获取聊天室信息
                getAppkeyRoom();
            }).onFail(function (data) {

                console.log('error:' + JSON.stringify(data));
            }).onTimeout(function (data) {
                console.log('timeout:' + JSON.stringify(data));
            });
        }

    })(mui, jQuery)
})