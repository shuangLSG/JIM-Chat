$(function () {
    (function (mui, $) {
        var hasOffline = 0;
        var ChatStore = {
                conversation: [],
                messageList: [],
                newMessage: {},
                imageViewer: []
            },
            imageViewer = {
                result: [],
                active: {
                    index: -1
                },
                show: false,
            },
            userInfo = {
                avatarUrl: ""
            },
            sourceUrl = '',
            imgviewindex = -1, // 当前预览图片的索引
            activeIndex = 0, // 目标用户在会话列表的索引 
            msgKey = 1; // 有用到
        /** ============== mui ==================*/

        var pageNumber = 20;
        var loadingCount = 1;
        mui.init({
            swipeBack: false, //启用右滑关闭功能
            pullRefresh: {
                container: '#pullrefresh',
                down: {
                    style: 'circle',
                    callback: pulldownRefresh, // ajax 具体操作
                }
            }
        });

        function pulldownRefresh() {
            setTimeout(function () {
                // 第二页： 21/40
                let msgs = ChatStore.messageList[activeIndex].msgs;
                if (msgs.length <= pageNumber * loadingCount) {
                    flage = false;
                } else {
                    // 48/40
                    flage = true;
                    loadingCount++;
                }
                const info = {
                    messageList: ChatStore.messageList,
                    active: {
                        activeIndex: activeIndex
                    },
                    loadingCount: loadingCount
                }
                getMemberAvatarUrl(info).then(msgs => {
                    getSourceUrl(info).then(data => {
                        if (data && data.length > pageNumber * loadingCount) {
                            // 取列表的后几位
                            msgs = data.slice(data.length - pageNumber * loadingCount);
                            console.log(data.length - pageNumber * loadingCount)
                            console.log(msgs)
                        } else if (data && data.length <= pageNumber) {
                            msgs = data;
                        }
                        const json = {
                            msgs: msgs.slice(0, pageNumber), //下拉刷新需要加载成dom的列表
                            global: global
                        }
                        $('.message ul').prepend(template('test', json));
                    })
                });
                mui('#pullrefresh').pullRefresh().endPulldownToRefresh(true);
            }, 1500)
        }
        var deceleration = mui.os.ios ? 0.003 : 0.0009;
        //初始化滚动组件
        mui('.mui-scroll-wrapper').scroll({
            bounce: true,
            indicators: false, //是否显示滚动条
            deceleration: deceleration
        });
        function scrollBottom() {
            mui('.mui-scroll-wrapper').scroll().reLayout();
            mui('.mui-scroll-wrapper').scroll().scrollToBottom(10);
        }

        /** =================================== 
                           JIM
        ======================================*/
        window.JIM = new JMessage({
            debug: true
        });
        var global = {
            username: "test0022",
            password: '123456',
            nickname: 'supvp.',
            media_id: 'header01.png'
        }
        var targetUser = {
            across_user: 'lsg222',

        }
        var across_appkey = '4f7aef34fb361292c566a1cd';

        init();
        //异常断线监听
        JIM.onDisconnect(function () {
            init();
        });

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


        









        //登录
        function login() {

            JIM.login({
                ...global
            }).onSuccess(function (data) {

                // 获取会话列表
                getConversation();

                // 发送单聊自定义消息
                // sendSingleCustom();


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

            /**
         * ========================
         *        接收到单聊新消息
         * ========================
         */
        async function receiveSingleMessage(data) {
            const content = data.messages[0].content;
            // 如果接收的是图片或者文件
            data = await getMediaUrl(data);
            console.log(data)
            const result = ChatStore.conversation.filter((conversation) => {
                return data.messages[0].content.from_id === conversation.name;
            });
            if (result.length === 0) {
                const messages = data.messages[0];
                const msg = getMsgAvatarUrl(messages);               
                content = msg.content;
            } else {
                // 给已有的单聊用户添加头像
                content.avatarUrl = result[0].avatarUrl;
            }
            
            // Dom
            const payload = {
                success: 3,
                type: 3,
                messages: data.messages
            }
            addMessage(ChatStore, payload, global);
            $('.message ul').append(template('recivemsg_text', ChatStore.newMessage))
            scrollBottom(); // 滚动到底部
        }
        // 接收消息获取media url
        async function getMediaUrl(data) {
            if (data.messages[0].content.msg_body.media_id) {
                const urlObj = { media_id: data.messages[0].content.msg_body.media_id };
                const urlInfo = await apiService.getResource(urlObj);
                if (urlInfo.code) {
                    data.messages[0].content.msg_body.media_url = '';
                } else {
                    data.messages[0].content.msg_body.media_url = urlInfo.url;
                }
                return data;
            }
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
        // ============================      获取离线消息
        function creatChatPanel(data) {
            getAllMessage(data).then(data => {
                // 获取客服的离线消息

                data.forEach((item, index) => {
                    if (item.from_username == targetUser.across_user) {
                        activeIndex = index;
                    }
                });
                info = {
                    messageList: data,
                    active: {
                        activeIndex: activeIndex || 0
                    },
                    loadingCount: loadingCount
                }
                return info;
            }).then(info => {

                getMemberAvatarUrl(info).then(msgs => {

                    getSourceUrl(info).then(data => {
                        if (data && data.length > pageNumber) {
                            msgs = data.slice(data.length - pageNumber);
                        } else if (data && data.length <= pageNumber) {
                            msgs = data;
                        }
                        const json = {
                            msgs: msgs,
                            global: global
                        }
                        console.log(json)

                        $('.message ul').html(template('test', json));
                        scrollBottom(); // 滚动到底部

                        // 图片预览的处理
                        let imgResult = filterImageViewer();
                        imageViewer.result = imgResult;
                        console.log(imgResult)
                    })
                })
            })
        }

        /**
         * ========================
         *        图片预览
         * ========================
         */
        // 过滤出当前图片预览的数组
        function filterImageViewer() {
            let messageList = ChatStore.messageList[activeIndex];
            if (activeIndex < 0 || !messageList || !messageList.msgs) {
                return [];
            }
            let imgResult = [];
            let msgs = messageList.msgs;
            for (let message of msgs) {
                let content = message.content;
                const jpushEmoji = (!content.msg_body.extras || !content.msg_body.extras.kLargeEmoticon ||
                    content.msg_body.extras.kLargeEmoticon !== 'kLargeEmoticon');
                if (content.msg_type === 'image' && jpushEmoji) {
                    imgResult.push({
                        mediaId: content.msg_body.media_id,
                        src: content.msg_body.media_url,
                        width: content.msg_body.width,
                        height: content.msg_body.height,
                        msg_id: message.msg_id
                    });
                }
            }
            return imgResult;
        }
        // 加载预览图片的图片url
        async function loadViewerImage(info) {
            const urlObj = {
                media_id: info.mediaId
            };
            const data = await apiService.getResource(urlObj);
            if (data.code) {
                this.errorFn(data);
            } else {
                info.src = data.url;
                // 加载图片预览没有加载的图片url
                // ChatStore.viewerImageUrl = info;
                addImageUrl(info);
            }
        };

        function addImageUrl(viewerImageUrl) {
            for (let img of imageViewer.result) {
                if (img.index === viewerImageUrl.index && img.src === viewerImageUrl.src) {
                    img.src = viewerImageUrl.src;
                    imageViewer.active = Util.deepCopyObj(imageViewer.result[imgviewindex]);
                    imageViewer.active.index = imgviewindex;
                    break;
                }
            }
        }
        // 图片预览
        function imageViewerShow(item) {
            for (let i = 0; i < imageViewer.result.length; i++) {
                const msgIdFlag = item.msg_id && imageViewer.result[i].msg_id == item.msg_id;
                // const msgKeyFlag = item.msgKey && imageViewer.result[i].msgKey === item.msgKey;
                if (msgIdFlag) {
                    imageViewer.active = Util.deepCopyObj(imageViewer.result[i]);
                    imageViewer.active.index = i;
                    break;
                }
            }
            imageViewer.show = true;
            console.log(imageViewer)
            // viewer = imageViewer;
        }

        function prev() {
            const activeIndex = imageViewer.active.index;
            const index = activeIndex > 0 ? activeIndex - 1 : activeIndex;
            imgviewindex = index;
            if (imgviewindex !== activeIndex) {
                // 如果该图片的url尚未加载，则去请求url
                if (!imageViewer.result[index].src) {
                    // this.imgHidden = true;
                    // this.store$.dispatch({
                    //     type: chatAction.loadViewerImage,
                    //     payload: this.imageViewer.result[index]
                    // });
                } else {
                    // 为了解决相邻两张相同的base64图片不触发onload事件
                    if (imageViewer.active.src === imageViewer.result[index].src) {
                        this.imgHidden = false;
                    } else {
                        this.imgHidden = true;
                    }
                    imageViewer.active = Object.assign({}, imageViewer.result[index], {});
                    imageViewer.active.index = index;
                }
            } else {
                mui.toast('已经是第一张了');
            }
        }

        function next() {
            const activeIndex = imageViewer.active.index;
            const index = activeIndex < imageViewer.result.length - 1 ?
                activeIndex + 1 : activeIndex;
            if (index !== activeIndex) {
                // 为了解决相邻两张相同的base64图片不触发onload事件
                if (imageViewer.active.src === imageViewer.result[index].src) {
                    this.imgHidden = false;
                } else {
                    this.imgHidden = true;
                }
                imageViewer.active = Object.assign({}, imageViewer.result[index], {});
                imageViewer.active.index = index;
            } else {
                mui.toast('已经是最后一张了');
            }
        }

        function closeViewerAction(event) {
            this.imageViewer.show = false;
            this.closeImageViewer.emit();
            event.stopPropagation();
        }
        // ==========================================页面事件操作
        // 发送文本信息
        document.querySelector('.action').addEventListener('tap', function (e) {
            var oTarget = e.target;
            if (oTarget.id == 'test-send') {
                sendSingleMsg();
            }
        });
        // 发送图片信息
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
                sendPicAction(file, emit);
            })
        }
        mui('.mui-scroll').on('tap', '.image img', function () {
            console.log(this)
            var msg_id = this.dataset.msg_id;
            imageViewerShow({
                msg_id: msg_id
            });
        })



        //获取对话列表
        async function getConversation() {
            const info = await apiService.getConversation();

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
            ChatStore.conversation = info.conversations;
        }
        // 发送单聊自定义消息
        async function sendSingleCustom() {
            const data = {
                'target_username': targetUser.across_user,
                'custom': {
                    'id': 75
                },
                'appkey': across_appkey,
                'nead_receipt': true
            }
            const custom = await apiService.sendSingleCustom(data);
            console.log(custom)
        }


        // =============================== 离线消息
        // 获取所有漫游同步消息
        function getAllMessage(data) {
            return new Promise((resolve) => {
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
                resolve(data);
                ChatStore.messageList = data;

            })
        }

        // 获取messageList avatar url
        function getMemberAvatarUrl(info) {
            return new Promise((resolve) => {
                let userArr = [];
                const msgs = info.messageList[info.active.activeIndex].msgs;
                const end = msgs.length - (info.loadingCount - 1) * pageNumber;
                console.log(end, info.loadingCount, pageNumber)

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
                    console.log(i)
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
                }, 400)
            })
        }
        // 获取messageList 图片消息url
        function getSourceUrl(info) {
            return new Promise(async (resolve) => {
                const msgs = info.messageList[info.active.activeIndex].msgs;
                const end = msgs.length - (info.loadingCount - 1) * pageNumber;
                // 滚动加载资源路径
                if (end >= 1) {
                    for (let i = end - 1; i >= end - pageNumber && i >= 0; i--) {
                        const msgBody = msgs[i].content.msg_body;
                        if (msgBody.media_id && !msgBody.media_url) {
                            const urlObj = {
                                media_id: msgBody.media_id
                            };

                            await apiService.getResource(urlObj).then((urlInfo) => {
                                if (urlInfo.code) {
                                    msgs[i].content.msg_body.media_url = '';
                                } else {
                                    sourceUrl = urlInfo.url;
                                    msgs[i].content.msg_body.media_url = urlInfo.url;
                                }
                                console.log(i)
                                console.log('图片url:' + urlInfo.url)
                            });

                        }

                    }
                }
                setTimeout(function () {
                    resolve(msgs);
                    ChatStore.messageList[info.active.activeIndex].msgs = msgs;
                }, 00)
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
            var content = $('.action textarea').val();
            if (content == '') return;
            JIM.sendSingleMsg({
                'target_username': targetUser.across_user,
                'appkey': across_appkey,
                'content': content,
                'no_offline': false,
                'no_notification': false,
                need_receipt: true
            }).onSuccess(function (data, msg) {
                const payload = {
                    success: 3,
                    type: 3,
                    msgs: msg
                }
                addMessage(ChatStore, payload, global);
                $('.message ul').append(template('send_singlemsg_text', ChatStore.newMessage))
                scrollBottom(); // 滚动到底部
                $('.action textarea').val('');
            })
        }


        // 发送单聊图片
        async function sendSinglePic(img) {
            const msg = apiService.sendSinglePic(img.singlePicFormData);
            const payload = {
                msgs: img.msgs,
                type: 3,
            }
            addMessage(ChatStore, payload, global);
            $('.message ul').append(template('send_singlemsg_img', ChatStore.newMessage))
            scrollBottom(); // 滚动到底部
        }

        function sendPicAction(file, data) {
            const isNotImage = '选择的文件必须是图片';
            Util.imgReader(file,
                () => console.error(isNotImage),
                (value) => {
                    sendPicContent(value, data).then(img => {
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
                msgKey: msgKey++,
            };
            const singlePicFormData = {
                target_username: targetUser.across_user,
                appkey: across_appkey,
                image: data.img,
                need_receipt: true
            };
            msgs.singlePicFormData = singlePicFormData;
            msgs.msg_type = 3;

            return new Promise((resolve, reject) => {
                resolve({
                    singlePicFormData,
                    msgs
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
                    global.avatarUrl = urlInfo.url;
                }
            }
        }
    })(mui, jQuery)
})