$(function () {
    (function (mui, $) {

        var chatState = null,
            defaultAvatar = 'logo.png';


        /** ============== mui ==================*/
        mui.init({
            swipeBack: false, //启用右滑关闭功能
        });
        var scroll = mui('.mui-scroll-wrapper').scroll({
            bounce: true //是否启用回弹
        });

        function scrollBottom() {
            mui('.mui-scroll-wrapper').scroll().reLayout();
            mui('.mui-scroll-wrapper').scroll().scrollToBottom(100);
        }

        var hasOffline = 0;
        var ChatStore = {
                conversation: []
            },
            userInfo = {
                avatarUrl: ""
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
        }
        var targetUser = {
            across_user: 'lsg222',
            target_nickname:'supvp.'
        }
        var appkey = '5244aea56672ae685d799270';

        init();

        function register() {
            JIM.register({
                ...global

            }).onSuccess(function (data) {
                console.log('注册 success:----------------------------------')
                console.log(data);
            });
        }

        function init() {
            var time = new Date().getTime();
            JIM.init({
                "appkey": '4f7aef34fb361292c566a1cd',
                "random_str": "404",
                "signature": '7db047a67a9d7293850ac69d14cc82bf',
                "timestamp": 1507882399401,
                "flag": 1
            }).onSuccess(function (data) {
                login();
                hasOffline = 0;
            }).onFail(function (data) {
                console.log('error:' + JSON.stringify(data))
            });
        }


        // 接收到单聊新消息
        function receiveSingleMessage(data) {
            console.log(data)
            let content = data.messages[0].content;
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
            $('.messge ul').append(template('recivemsg_text',data.messages[0]))
            scrollBottom(); // 滚动到底部
            
            // receiveSingleMsgDom(data.messages[0]);
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

                setSelfAvatar();

                JIM.onMsgReceive(function (data) {
                    receiveSingleMessage(data);
                });

            })
        }

        // ============================           逻辑
        function creatChatPanel(data) {
            getAllMessage(data).then(data => {
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
                        activeIndex: activeIndex || 0
                    }
                }
                return info;
            }).then(info => {
                getMemberAvatarUrl(info).then(msgs => {
                    const json = {
                        msgs: msgs,
                        global: global
                    }
                    $('.message ul').html(template('test', json));
                    scrollBottom(); // 滚动到底部
                    // chatPanelDom(json);
                })
            });
        }
        // 发送信息
        document.querySelector('.action').addEventListener('tap', function (e) {
            var oTarget = e.target;
            if (oTarget.id == 'test-send') {
                sendSingleMsg().then(info => {
                    $('.message ul').append(template('send_singlemsg_text', info));
                    scrollBottom(); // 滚动到底部
                })
            }
        });
        // 发送信息
        // sendPicEvent();
        // function sendPicEvent() {
            var oimg = document.querySelector('#sendPic2');
            var PicURL = window.URL || window.webkitURL;
            if (PicURL) {
                // 给input添加监听
                $(oimg).change(function () {
                    var file = oimg;
                    let img = Util.getFileFormData(oimg);
                    const emit = {
                        img: img,
                        type: "send"
                    }
                    sendPicAction(file,emit);
                })
            }
        // }
        //获取对话列表
        function getConversation() {
            apiService.getConversation().then((info) => {
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
            })
        }



        // =============================== 离线消息
        // 获取所有漫游同步消息
        async function getAllMessage(data) {

            for (let dataItem of data) {
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
            const info = await apiService.getConversation();
            ChatStore.conversation = info.conversations;
            // 加载会话头像
            for (let conversation of info.conversations) {
                if (conversation.avatar && conversation.avatar !== '') {
                    const urlObj = {
                        media_id: conversation.avatar
                    };
                    apiService.getResource(urlObj).then((urlInfo) => {
                        if (!urlInfo.code) {
                            conversation.avatarUrl = urlInfo.url;
                        }
                    });
                }
            }
            return data;
        }
        // 获取messageList avatar url
        function getMemberAvatarUrl(info) {
            return new Promise((resolve) => {
                let userArr = [];
                const msgs = info.messageList[info.active.activeIndex].msgs;
                for (let i = 0; i < msgs.length; i++) {
                    msgs[i].content.avatarUrl = '';
                    if (msgs[i].content.from_id !== global.username &&
                        userArr.indexOf(msgs[i].content.from_id) < 0) {
                        userArr.push(msgs[i].content.from_id);
                    }
                }
                // 添加自己，设置头像
                userArr.push(global.username);

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
                                    for (let i = 0; i < msgs.length; i++) {
                                        if (msgs[i].content.from_id === user) {
                                            msgs[i].content.avatarUrl = urlInfo.url;
                                        }
                                    }
                                }
                            })
                        }
                    });
                }
                setTimeout(function () {
                    resolve(msgs);
                }, 500)
            })
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
            return new Promise((resolve) => {
                var content = $('.action textarea').val();
                if (content == '') return;
                JIM.sendSingleMsg({
                    'target_username': targetUser.across_user,
                    'appkey': targetUser.across_appkey,
                    'content': content,
                    'no_offline': false,
                    'no_notification': false,
                    need_receipt: true
                }).onSuccess(function (data, msg) {
                    console.log(data);
                    console.log(msg);
                    setTimeout(function () {
                        resolve({ ...data,
                            ...msg,
                            avatarUrl: userInfo.avatarUrl
                        });
                    }, 400)
                })
            });
        }
        // 发送单聊图片
        function sendSinglePic(img) {
            JIM.sendSinglePic(img.singlePicFormData).onSuccess(function (data, msg) {
                console.log(data);
                console.log(msg);
                // setTimeout(function () {
                //     resolve({ ...data,
                //         ...msg,
                //         avatarUrl: userInfo.avatarUrl
                //     });
                // }, 400)
            }).onFail(function (data) {
                console.log(data);
            });
        }

        function sendPicAction(file,data) {
            const isNotImage = '选择的文件必须是图片';
            Util.imgReader(file,
                () => console.error(isNotImage),
                (value) => {
                    sendPicContent(value, data).then(img=>{
                        sendSinglePic(img)
                    })
                }
            );
        }

        function sendPicContent(value, data) {
            let msgs = {
                content: {
                    from_id: global.username,
                    msg_type: 'image',
                    msg_body: {
                        media_url: value.src,
                        width: value.width,
                        height: value.height
                    }
                },
                ctime_ms: new Date().getTime(),
                success: 1,
                unread_count: 0,
                // msgKey: this.msgKey++,                
            };
            const singlePicFormData = {
                target_username: targetUser.across_user,
                target_nickname:targetUser.target_nickname,
                appkey: appkey,
                image: data.img,
                need_receipt: true
            };
            msgs.singlePicFormData = singlePicFormData;
            msgs.msg_type = 3;
            
            return new Promise((resolve, reject) => {
                resolve({
                    singlePicFormData,
                    msgs,
                    // key: this.active.key,                    
                    // active: this.active
                });
            })
        }


        // =====================================  个人消息

        // 更新个人头像
        var $input = $('#fileId');
        var URL = window.URL || window.webkitURL;
        if (URL) {
            // 给input添加监听
            $input.change(function () {

                var file = document.getElementById('fileId').files[0];
                let fd = new FormData();
                fd.append(file.name, file);
                var avatarConfig = {
                    avatar: {
                        formData: fd,
                        url: 'logo.png',
                    },
                    info: {
                        nickname: '',
                        username: 'lsg222'
                    }
                }
                updateSelfInfo(avatarConfig)
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
            if (!data.code) {
                setSelfAvatar(self);
            }
        }

        async function setSelfAvatar(self) {
            const userObj = {
                username: global.username
            };
            var data = await apiService.getUserInfo(userObj);
            if (!data.code && data.user_info.avatar !== '') {
                const urlObj = {
                    media_id: data.user_info.avatar
                };
                var urlInfo = await apiService.getResource(urlObj);
                if (!urlInfo.code) {
                    userInfo.avatarUrl = urlInfo.url;
                }
            }
        }




/*
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
                                        <img class="avatar" src="${i.content.avatarUrl ? i.content.avatarUrl : 'logo.png'}" />
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
                                            <img class="avatar" src="${i.content.avatarUrl ? i.content.avatarUrl : 'logo.png'}" />
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
                                <img class="avatar" src="${content.avatarUrl ? content.avatarUrl : 'logo.png'}" />
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
                                <img class="avatar" src="${data.avatarUrl ? data.avatarUrl : 'logo.png'}" />
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
                    html += `<span>${dateFormat(ctime_ms, 'yyyy-MM-dd hh:mm')}</span>`
                    break;
                case 'month':
                    html += `<span>${dateFormat(ctime_ms, 'yyyy-MM-dd hh:mm')}</span>`
                    break;
                case 'day':
                    html += `<span>${dateFormat(ctime_ms, 'dd hh:mm')}</span>`
                    break;
                case 'the day before':
                    html += `<span>前天${dateFormat(ctime_ms, 'hh:mm')}</span>`
                    break;
                case 'yesterday':
                    html += `<span>昨天${dateFormat(ctime_ms, 'hh:mm')}</span>`
                    break;
                case 'today':
                    html += `<span>${dateFormat(ctime_ms, 'hh:mm')}</span>`
                    break;
            }
            return html + '</p>';
        }*/
    })(mui, jQuery)
})