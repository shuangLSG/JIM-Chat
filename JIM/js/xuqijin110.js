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
            media_id: './logo.png',
            nickname: 'supvp.'
        }
        var targetUser = {
            across_user: 'test0022',
            across_appkey: '4f7aef34fb361292c566a1cd'
        }

        var appkey = '5244aea56672ae685d799270';
        var userInfo = null;
        var conversationMsg = null; // 离线信息
        init();


        function register() {
            JIM.register({
                ...global,
            }).onSuccess(function (data) {
                console.log('注册 success:----------------------------------')
                console.log(data);
            });
        }

        function init() {
            JIM.init({
                "appkey": '4f7aef34fb361292c566a1cd',
                "random_str": "404",
                "signature": '7db047a67a9d7293850ac69d14cc82bf',
                "timestamp": 1507882399401,
                "flag": 1
            }).onSuccess(function (data) {
                if (!JIM.isLogin()) {
                    login();
                }
            }).onFail(function (data) {
                console.log('error:' + JSON.stringify(data))
            });
        }



        var chat = null;

        //登录
        function login() {

            JIM.login({
                ...global
            }).onSuccess(function (data) {

                //离线消息同步监听
                JIM.onSyncConversation(function (data) {
                    chat = data;
                    console.log('--------------')
                    console.log(data);
                    // 获取客服的离线消息
                    getSinglefMsg(data, targetUser.across_user);
                });


                JIM.onMsgReceive(function (data) {
                    console.log(data)
                    chat.forEach((item, index) => {
                        data.messages.forEach((msg, i) => {
                            if (item.from_username == msg.from_username) {
                                item.msgs.push(msg);

                            }
                        })
                    })
                    console.log('聊天消息实时监听');
                });

                // 发送信息
                document.querySelector('.action').addEventListener('tap', function (e) {
                    var oTarget = e.target;
                    if (oTarget.id == 'test-send') {
                        sendSingleMsg();
                    }
                })
            })
        }


        // 获取单聊信息
        function getSinglefMsg(data, username) {
            var activePerson = null;
            data.forEach(item => {
                if (item.from_username == username) {
                    activePerson = item;
                }
            });

            // 获取单聊对象的用户信息
            JIM.getUserInfo({
                username: username
            }).onSuccess(function (data) {
                console.log(data)
                var json = {
                    msgs: activePerson.msgs,
                    user_info: data.user_info,
                    global: global
                }
                $('.message').append(template('test', json));
                scrollBottom(); // 滚动到底部
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
    })(mui, jQuery)
})