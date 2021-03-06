

$(function () {
    (function (mui, $) {
        var conversationList = null,
            chatState = null;


        /** ============== mui ==================*/
        mui.init({
            swipeBack: false, //启用右滑关闭功能
            pullRefresh: {
                container: '#pullrefresh',
                down: {
                    contentdown: "下拉可以刷新", //可选，在下拉可刷新状态时，下拉刷新控件上显示的标题内容
                    contentover: "释放立即刷新", //可选，在释放可刷新状态时，下拉刷新控件上显示的标题内容
                    contentrefresh: "正在刷新...", //可选，正在刷新状态时，下拉刷新控件上显示的标题内容
                    // callback: pulldownRefresh, // ajax 具体操作
                }
            }
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

        /**
         * 下拉刷新具体业务实现
         */
        // 消息列表中滚动加载的每页消息的条数
        var pageNumber = 20,
            loadingCount = 1;
        var flage = true; //判断条件  
        function pulldownRefresh() {
            setTimeout(function () {
             
                // 第二页： 21/40
                if (conversationList.length <= pageNumber * loadingCount) { // 获取到第3页的数据就结束上拉操作
                    flage = false;
                    msg = conversationList;
                } else {
                    // 48/40
                    flage = true;
                    loadingCount++;
                    console.log(conversationList.length - pageNumber * loadingCount)
                    msg = conversationList.slice(conversationList.length - pageNumber * loadingCount);
                    console.log(msg)
                }

                var json = {
                    msgs: msg,
                    global: global
                }
                
                $('.message ul').html(template('test', json));

                mui('#pullrefresh').pullRefresh().endPullupToRefresh(!flage);

            }, 500);

        }
        
        /** =================================== 
                           JIM
        ======================================*/
        window.JIM = new JMessage({
            debug: false
        });
        var global = {
            username: "liu_sg",
            password: '123456',
            media_id: './logo.png',
            nickname: 'supvp.'
        }
        var targetUser = {
            across_user: 'xuqijin110',
            // across_appkey: '4f7aef34fb361292c566a1cd'
        }

        var appkey = '5244aea56672ae685d799270';
        var userInfo = null;
        var conversationMsg = null; // 离线信息
        init();
        
       
        function register() {
            JIM.register({
                ...global,
                avatar:'./logo.png'
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
                register()
                if (!JIM.isLogin()) {
                    login();
                }
            }).onFail(function (data) {
                console.log('error:' + JSON.stringify(data))
            });
        }


        // 收到新消息
        function receiveNewMessage(data) {
            var msgs = null;
            if (data.messages[0].content.from_id === global.username) {
                isMySelf = true;
            } else {
                msgs = data;
                isMySelf = false;
            }
            return msgs;
        }
        // 同步自己发送的消息
        function syncReceiveMessage() {

        }
        // 接收到单聊新消息
        function receiveSingleMessage(data) {
            const content = data.messages[0].content;
            console.log(chatState)
            const result = chatState.conversations.filter((conversation) => {
                return data.messages[0].content.from_id === conversation.name;
            });
            if (result.length === 0) {
                const messages = data.messages[0];
                getMsgAvatarUrl(messages, promises);
            } else {
                // 给已有的单聊用户添加头像
                content.avatarUrl = result[0].avatar;
            }
            return content;
        }
        // 获取新消息的用户头像url
        function getMsgAvatarUrl(messages) {
            const username = messages.content.from_id !== global.username ?
                messages.content.from_id : messages.content.target_id;
            const userObj = {
                username
            };
        }









        //登录
        function login() {

            JIM.login({
                ...global
            }).onSuccess(function (data) {

                // 获取会话列表
                getConversation();

                //离线消息同步监听
                JIM.onSyncConversation(function (data) {
                    
                    console.log('--------------')
                    console.log(data);
                    // 获取客服的离线消息
                    var activeIndex = null;
                    data.forEach((item, index) => {
                        if (item.from_username == targetUser.across_user) {
                            activeIndex = index;
                        }
                    });
                    info = {
                        messageList: data,
                        active: {
                            activeIndex: activeIndex
                        },
                        loadingCount: loadingCount
                    }
                    conversationList = getMemberAvatarUrl(info);
                    var json = {
                        msgs: conversationList,
                        global: global
                    }
                    console.log(json.msgs)
                    console.log(json.msgs[281])
                    $('.message ul').append(template('test', json));
                    scrollBottom(); // 滚动到底部
                });

  // 获取单聊对象的用户信息
  JIM.getUserInfo({
    username: 'test0022'
}).onSuccess(function (data) {
    console.log(data)
    
}).onFail(function (data) {
    console.log(data);
});
                // JIM.onMsgReceive(function (data) {

                //     var singleMsgs = receiveSingleMessage(data);
                //     console.log(singleMsgs)
                //     $('.message').append(template('recivemsg', singleMsgs));
                //     scrollBottom(); // 滚动到底部
                //     console.log('聊天消息实时监听');
                // });


                // 发送信息
                document.querySelector('.action').addEventListener('tap', function (e) {
                    var oTarget = e.target;
                    if (oTarget.id == 'test-send') {
                        sendSingleMsg();
                    }
                })
            })
        }

        //获取对话列表
        function getConversation() {
            console.log('获取对话列表---------')
            JIM.getConversation().onSuccess(function (data) {
                // data.conversations = data.conversations.sort(function (a, b) {
                //     return b.mtime - a.mtime;
                // })
                chatState = data;
                console.log(chatState)
            }).onFail(function (data) {
                console.log('error:' + JSON.stringify(data));
            });
        }

        // =============================== 离线消息

        // 获取messageList avatar url
        function getMemberAvatarUrl(info) {
            let userArr = [];
            const msgs = info.messageList[info.active.activeIndex].msgs;
            const end = msgs.length - (info.loadingCount - 1) * pageNumber;
            for (let i = end - 1; i >= end - pageNumber && i >= 0 && end >= 1; i--) {
                // 如果是已经加载过头像的用户
                if (info.loadingCount !== 1) {
                    let flag = false;
                    for (let j = end; j < msgs.length; j++) {
                        if (msgs[i].content.from_id === msgs[j].content.from_id) {
                            if (msgs[j].content.avatarUrl) {
                                msgs[i].content.avatarUrl = msgs[j].content.avatarUrl;
                                flag = true;
                            }
                            break;
                        }
                    }
                    if (flag) {
                        continue;
                    }
                }
                msgs[i].content.avatarUrl = '';
                // 第一次加载头像的用户
                if (msgs[i].content.from_id !== global.username &&
                    userArr.indexOf(msgs[i].content.from_id) < 0) {
                    userArr.push(msgs[i].content.from_id);
                }
            }

            for (let user of userArr) {
                const userObj = {
                    username: user
                };
                JIM.getUserInfo({
                    ...userObj
                }).onSuccess(function (data) {
                    if (!data.code && data.user_info.avatar !== '') {
                        const urlObj = {
                            media_id: data.user_info.avatar
                        };
                        JIM.getResource({
                            ...urlObj
                        }).onSuccess(function (data) {
                            if (!data.code) {
                                for (let i = end - 1; i >= end - pageNumber && i >= 0 && end >= 1; i--) {
                                    if (msgs[i].content.from_id === user) {
                                        console.log(i)
                                        msgs[i].content.avatarUrl = data.url;
                                    }
                                }
                            }
                        })
                    }
                }).onFail(function (data) {
                    console.log(data);
                });
            }
            return msgs;
        }

        // 获取单聊信息
        function getSinglefMsg(data, username) {
            var activePerson = null;

            // 获取单聊对象的用户信息
            JIM.getUserInfo({
                username: username
            }).onSuccess(function (data) {
                console.log(data);
                // if (!data.user_info.avatar || data.user_info.avatar === '') {
                //     messages.content.avatarUrl = '';
                // } else {
                //     const urlObj = { media_id: data.user_info.avatar };
                //     const pro3: any = await this.apiService.getResource(urlObj);
                //     promises.push(pro3);
                //     if (pro3.code) {
                //         messages.content.avatarUrl = '';
                //     } else {
                //         messages.content.avatarUrl = pro3.url;
                //     }
                // }
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