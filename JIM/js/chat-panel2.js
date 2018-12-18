$(function () {
    (function (mui, $) {
        /** =================================== 
                            mui
        ======================================*/
        mui.init({
            swipeBack: false, //启用右滑关闭功能
        });
        var scroll = mui('.mui-scroll-wrapper').scroll({
            bounce: false //是否启用回弹
        });

        function scrollBottom() {
            //重新计算布局值，最大滚动的高度等等
            mui('.mui-scroll-wrapper').scroll().reLayout();
            //滚动到底部
            mui('.mui-scroll-wrapper').scroll().scrollToBottom(100);
        }

        /** =================================== 
                           JIM
        ======================================*/
        window.JIM = new JMessage({
            debug: true
        });
        var global = {
            user: 'xuqijin110',
            password: '123456',
        }
        var targetUser={
            across_user : 'test0022',
            across_appkey : '4f7aef34fb361292c566a1cd'
        }
      
        var appkey = '5244aea56672ae685d799270';
        var userInfo = null;

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

        init();

        // 初始化状态成功后 再进行后续操作
        setTimeout(function () {
            if (JIM.isInit()) {
                register();
            }
        }, 1000)


        function register() {
            JIM.register({
                ...global,
                'nickname': 'nickname'
            }).onSuccess(function (data) {
                console.log('register success:----------------------------------')
                console.log(data);
            }).onFail(function (data) {
                console.log(data)
            });
        }

        setTimeout(function () {
            if (JIM.isInit() && !JIM.isLogin()) {
                login();
            }
        }, 1000)


        function login() {
            JIM.login({
                ...global
            }).onSuccess(function (data) {
                console.log('login success:----------------------------------')
                // 获取用户信息
                getSelfInfo();
                // 接受消息
                JIM.onMsgReceive(function (data) {
                    console.log(
                        'onMsgReceive接受消息:----------------------------------')
                    // console.log(data.messages)
                });
                // 接受离线消息
                JIM.onSyncConversation(function (data) {
                    console.log(
                        'onSyncConversation接受离线消息:----------------------------------'
                    )
                    console.log(data)

                    var activePerson = null;
                    data.forEach(item => {
                        if (item.from_username == global.user) {
                            activePerson = item;
                        }
                    });
                    var json = {
                        msgs: activePerson.msgs,
                        global: global
                    }
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
                // JIM.onEventNotification(function (data) {
                //     console.log('event_receive: ' + JSON.stringify(data));
                // });

                // JIM.onSyncConversation(function (data) { //离线消息同步监听
                //     console.log(data);
                // });

                // JIM.onUserInfUpdate(function (data) {
                //     console.log('onUserInfUpdate : ' + JSON.stringify(data));
                // });

                // JIM.onSyncEvent(function (data) {
                //     console.log('onSyncEvent : ' + JSON.stringify(data));
                // });

                // JIM.onMsgReceiptChange(function (data) {
                //     console.log('onMsgReceiptChange : ' + JSON.stringify(data));

                // });

                // JIM.onSyncMsgReceipt(function (data) {
                //     console.log('onSyncMsgReceipt : ' + JSON.stringify(data));

                // });

                // JIM.onMutiUnreadMsgUpdate(function (data) {
                //     console.log('onConversationUpdate : ' + JSON.stringify(data));
                // });

                // JIM.onTransMsgRec(function (data) {
                //     console.log('onTransMsgRec : ' + JSON.stringify(data));
                // });

                // JIM.onRoomMsg(function (data) {
                //     console.log('onRoomMsg  : ' + JSON.stringify(data));
                // });

            }).onFail(function (data) {

                console.log('error:' + JSON.stringify(data));
            }).onTimeout(function (data) {
                console.log('timeout:' + JSON.stringify(data));
            });
        }
        // 获取用户信息
        function getSelfInfo(username) {
            JIM.getUserInfo({
                'username': username
            }).onSuccess(function (data) {
                console.log('success:' + JSON.stringify(data));
            }).onFail(function (data) {
                console.log('error:' + JSON.stringify(data));
            });

        }

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
                // 添加字段 ctime_ms
                msg.ctime_ms=msg.content.create_time;
                // 刷新页面
                $('.message ul').append(template('singlemsg', msg));
                // 清空 input
                $('.action textarea').val('');
                scrollBottom(); // 滚动到底部

                console.log(data);
                console.log(msg);
            }).onFail(function (data) {
                console.log('error:' + JSON.stringify(data));
            });
        }
    })(mui, jQuery)
})