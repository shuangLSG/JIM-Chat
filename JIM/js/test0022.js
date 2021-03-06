$(function () {
    (function (mui, $) {
        var conversationList = null,
            chatState = null,
            defaultAvatar = 'logo.png';


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

        var hasOffline = 0;
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

                // $('.message ul').html(template('test', json));

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
            username: "test0022",
            password: '123456',
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
                    hasOffline = 0;
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
            console.log(data)
            const content = data.messages[0].content;
            const result = chatState.conversations.filter((conversation) => {
                return data.messages[0].content.from_id === conversation.name;
            });
            if (result.length === 0) {
                const messages = data.messages[0];
                content = getMsgAvatarUrl(messages).content;
            } else {
                // 给已有的单聊用户添加头像()
                content.avatarUrl = result[0].avatarUrl;
            }
            ChatStore.conversation=data;
            receiveSingleMsgDom(data.messages[0]);
        }
        // 获取新消息的用户头像url
        function getMsgAvatarUrl(messages) {
            const username = messages.content.from_id !== global.username ?
                messages.content.from_id : messages.content.target_id;
            const userObj = {
                username
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
                        if (data.code) {
                            messages.content.avatarUrl = '';
                        } else {
                            messages.content.avatarUrl = data.url;
                        }
                    })
                }

            }).onFail(function (data) {
                console.log(data);
            });
            return messages;
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
                    // 限制只触发一次
                    if (hasOffline === 0) {
                        hasOffline++;
                        creatChatPanel(data);
                    }
                });


                JIM.onMsgReceive(function (data) {
                    receiveSingleMessage(data);
                });

            })
        }

        // ============================           逻辑
        function creatChatPanel(data) {
            var allMsg = getAllMessage(data);
            // 获取客服的离线消息
            var activeIndex = null;
            allMsg.forEach((item, index) => {
                if (item.from_username == targetUser.across_user) {
                    activeIndex = index;
                }
            });
            info = {
                messageList: allMsg,
                active: {
                    activeIndex: activeIndex
                },
                loadingCount: loadingCount
            }
            getMemberAvatarUrl(info, function (result) {
                conversationList = result;
            });
            var json = {
                msgs: conversationList,
                global: global
            }
            setTimeout(function () {
                chatPanelDom(json);
            }, 1000)
        }
        // 发送信息
        document.querySelector('.action').addEventListener('tap', function (e) {
            var oTarget = e.target;
            if (oTarget.id == 'test-send') {
                sendSingleMsg();
            }
        });

        // 更新个人头像
        var $input = $('#fileId');
        var URL = window.URL || window.webkitURL;
        if (URL) {
            // 给input添加监听
            $input.change(function () {
                var file = document.getElementById('fileId').files[0];
                // selfAvatarChange(input) {
                var avatarConfig = getImgObj(file);
                updateSelfInfo(avatarConfig)
                // }
            })
        }
        async function updateSelfInfo(self) {
            var data = await apiService.updateSelfInfo(self.info);
            if (data.code) {
                mui.toast(data);
                if (self.avatar && self.avatar.url) {
                    updateSelfAvatar(self);
                }
            } else {
                if (self.avatar && self.avatar.url) {
                    updateSelfAvatar(self);
                }
            }
        }
        async function updateSelfAvatar(self) {
            const avatarObj = {
                avatar: self.avatar.formData
            };
            const data = await apiService.updateSelfAvatar(avatarObj);
            if (data.code) {

            } else {
                payload = {
                    avatar: self.avatar,
                    info: self.info,
                    loading: false
                }
            }
            console.log(data)
        }

        //获取对话列表
        function getConversation() {
            console.log('获取对话列表---------')

            JIM.getConversation().onSuccess(function (info) {
                // 加载会话头像
                for (let conversation of info.conversations) {
                    if (conversation.avatar && conversation.avatar !== '') {
                        const urlObj = {
                            media_id: conversation.avatar
                        };
                        JIM.getResource({
                            ...urlObj
                        }).onSuccess(function (urlInfo) {
                            if (!urlInfo.code) {
                                conversation.avatarUrl = urlInfo.url;
                            }
                        })
                    }
                }
                chatState = info;
                console.log(chatState)
            }).onFail(function (data) {
                console.log('error:' + JSON.stringify(data));
            });
        }



        // =============================== 离线消息
        // 获取所有漫游同步消息
        function getAllMessage(data) {
            var newData = data;
            for (let dataItem of newData) {
                // 时间显示方式
                for (let j = 0; j < dataItem.msgs.length; j++) {
                    if (j + 1 < dataItem.msgs.length || dataItem.msgs.length === 1) {
                        if (j === 0) {
                            dataItem.msgs[j].time_show =
                                Util.reducerDate(dataItem.msgs[j].ctime_ms);
                        }
                        if (j + 1 !== dataItem.msgs.length) {
                            if (Util.fiveMinutes(dataItem.msgs[j].ctime_ms,
                                    dataItem.msgs[j + 1].ctime_ms)) {
                                dataItem.msgs[j + 1].time_show =
                                    Util.reducerDate(dataItem.msgs[j + 1].ctime_ms);
                            }
                        }
                    }
                }
                for (let receiptMsg of dataItem.receipt_msgs) {
                    for (let message of dataItem.msgs) {
                        if (receiptMsg.msg_id === message.msg_id) {
                            message.unread_count = receiptMsg.unread_count;
                            break;
                        }
                    }
                }
                if (dataItem.msgs.length > 0) {
                    if (dataItem.msgs[0].msg_type === 3) {
                        dataItem.type = 3;
                        if (dataItem.msgs[0].content.from_id === global.username) {
                            dataItem.name = dataItem.msgs[0].content.target_id;
                            dataItem.appkey = dataItem.msgs[0].content.target_appkey;
                        } else if (dataItem.msgs[0].content.target_id === global.username) {
                            dataItem.name = dataItem.msgs[0].content.from_id;
                            dataItem.appkey = dataItem.msgs[0].content.from_appkey;
                        }
                    } else if (dataItem.msgs[0].msg_type === 4) {
                        dataItem.type = 4;
                    }
                }
            }
            return newData;
        } 
        // 获取messageList avatar url
        function getMemberAvatarUrl(info, callback) {
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
                apiService.getUserInfo(userObj).then((data) => {
                    if (!data.code && data.user_info.avatar !== '') {
                        const urlObj = {
                            media_id: data.user_info.avatar
                        };
                        apiService.getResource(urlObj).then((urlInfo) => {
                            if (!urlInfo.code) {
                                for (let i = end - 1; i >= end - pageNumber && i >= 0 && end >= 1; i--) {
                                    if (msgs[i].content.from_id === user) {
                                        console.log(i)
                                        msgs[i].content.avatarUrl = urlInfo.url;
                                    }
                                }
                            }
                        })
                    }
                });
            }
            (callback && typeof (callback) === "function") && callback(msgs);
        }

        // 获取单聊信息
        function getSinglefMsg(data, username) {
            var activePerson = null;

            // 获取单聊对象的用户信息
            JIM.getUserInfo({
                username: username
            }).onSuccess(function (data) {
                console.log(data);
                if (!data.user_info.avatar || data.user_info.avatar === '') {
                    messages.content.avatarUrl = '';
                } else {
                    const urlObj = {
                        media_id: data.user_info.avatar
                    };
                    JIM.getResource({
                        ...urlObj
                    }).onSuccess(function (urlInfo) {
                        if (!urlInfo.code) {
                            conversation.avatarUrl = urlInfo.url;
                        }
                    })
                }
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
            var content = $('.action textarea').val(),
                msg = null,
                data = null;
            if (content == '') return;
            var json = {
                'target_username': targetUser.across_user,
                'appkey': targetUser.across_appkey,
                'content': content,
                'no_offline': false,
                'no_notification': false,
                need_receipt: true
            }
            apiService.sendSingleMsg(json).then((data)=>{
                var json = {
                    ...msg,
                    content: {
                        msg_body: {
                            text: content
                        }
                    },
                    msg_type: 'text'
                }
                console.log(json)
                sendSingleMsgDom(json)
            });
            
        }
        


        //========================================  DOM

        function chatPanelDom(data) {
            console.log(data)
            var html = '',
                global = data.global;
            $.each(data.msgs, function (index, i) {

                // 文本消息
                if (i.content && global.username != i.content.from_id && i.msg_type !== 5) {
                    html += `<li>` + showTimeDom(i);
                    if (i.content.msg_type === 'text' && (!i.content.msg_body.extras || !i.content.msg_body.extras.businessCard)) {
                        html += `<div>
                                    <div class="avatar-box">
                                        <img class="avatar" src="${i.content.avatarUrl?i.content.avatarUrl:''}" />
                                    </div>   
                                    <div class="text"><p>${i.content.msg_body.text}</p></div>
                                </div>`;
                    }
                    html += `</li>`;
                } else {
                    html += `<li>` + showTimeDom(i);
                    if (i.content.msg_type === 'text' && (!i.content.msg_body.extras || !i.content.msg_body.extras.businessCard)) {
                        html += `<div class="self">
                                        <div class="avatar-box">
                                            <img class="avatar" src="${i.content.avatarUrl?i.content.avatarUrl:''}" />
                                        </div>   
                                        <div class="text"><p>${i.content.msg_body.text}</p></div>
                                    </div>`;
                    }
                    html += `</li>`;
                }
            })
            $('.message ul').html(html);
            scrollBottom(); // 滚动到底部
        }
        // 接受单聊文本消息
        function receiveSingleMsgDom(data) {
            console.log(data)
            var html = '',
                content = data.content;
            // 文本消息
            html += `<li>` + showTimeDom(data);
            if (content.msg_type === 'text' && (!content.msg_body.extras || !content.msg_body.extras.businessCard)) {
                html += `<div>
                            <div class="avatar-box">
                                <img class="avatar" src="${content.avatarUrl?content.avatarUrl:'logo.png'}" />
                            </div>   
                            <div class="text"><p>${content.msg_body.text}</p></div>
                        </div>`;
            }
            html += `</li>`;
            $('.message ul').append(html);
            scrollBottom(); // 滚动到底部
        }
        // 发送单聊消息
        function sendSingleMsgDom(data) {
            console.log(data)
            var html = '',
                content = data.content;
            // 文本消息
            html += `<li>` + showTimeDom(data);
            if (content.msg_type === 'text' && (!content.msg_body.extras || !content.msg_body.extras.businessCard)) {
                html += `<div class="self">
                            <div class="avatar-box">
                                <img class="avatar" src="${content.avatarUrl?content.avatarUrl:'logo.png'}" />
                            </div>   
                            <div class="text"><p>${content.msg_body.text}</p></div>
                        </div>`;
            }
            html += `</li>`;
            console.log(html);
            $('.message ul').append(html);
            // 清空 input
            $('.action textarea').val('');
            scrollBottom(); // 滚动到底部
        }
        function showTimeDom(data) {
            var html = '<p class="time">',
                ctime_ms = data.ctime_ms;
            switch (data.time_show) {
                case 'year':
                    html += `<span>${dateFormat(ctime_ms,'yyyy-MM-dd hh:mm')}</span>`
                    break;
                case 'month':
                    html += `<span>${dateFormat(ctime_ms,'yyyy-MM-dd hh:mm')}</span>`
                    break;
                case 'day':
                    html += `<span>${dateFormat(ctime_ms,'dd hh:mm')}</span>`
                    break;
                case 'the day before':
                    html += `<span>前天${dateFormat(ctime_ms,'hh:mm')}</span>`
                    break;
                case 'yesterday':
                    html += `<span>昨天${dateFormat(ctime_ms,'hh:mm')}</span>`
                    break;
                case 'today':
                    html += `<span>${dateFormat(ctime_ms,'hh:mm')}</span>`
                    break;
            }
            return html + '</p>';
        }
    })(mui, jQuery)
})