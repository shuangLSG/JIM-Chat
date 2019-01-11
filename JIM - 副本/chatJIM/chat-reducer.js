

// 添加消息到消息面板
function addMessage(state = ChatStore, payload,global) {
    
    // 判断消息是否要显示时间
    /*if (state.messageList.length === 0) {
        payload.time_show = Util.reducerDate(payload.ctime_ms);
    } else {
        const fiveMinutes =
            Util.fiveMinutes(state.messageList[state.messageList.length - 1].ctime_ms,
                payload.ctime_ms);
        if (fiveMinutes) {
            payload.time_show = Util.reducerDate(payload.ctime_ms);
        }
    }*/
    state.messageList.push(payload);
    // 接收到别人的消息添加到消息列表/同步自己发送的消息
    if (payload.messages && payload.messages[0]) {

        let message = payload.messages[0];
        // payload.msgs.ctime_ms = new Date().getTime();
        payload = isShowTime(state, payload);
        if (message.msg_type === 3) {
            const isMySelf = message.content.from_id !== global.username;// false:是自己
            message.content.name = isMySelf ? message.content.from_id : message.content.target_id;
            message.content.nickName =
                isMySelf ? message.content.from_name : message.content.target_name;
            message.content.appkey =
                isMySelf ? message.content.from_appkey : message.content.target_appkey;
            message.content.isMySelf =isMySelf;
        }
        filterNewMessage(state, payload, message);

        let flag = false;
        // 如果发送人在会话列表里
        for (let a = 0; a < state.conversation.length; a++) {

            const singleNoActive = message.msg_type === 3 ;
            if (singleNoActive) {
                // 接收别人发送的消息，未读数变化
                if (message.content.from_id !== global.username) {
                    if (!state.conversation[a].unreadNum) {
                        state.conversation[a].unreadNum = 1;
                    } else {
                        state.conversation[a].unreadNum++;
                    }
                }
            }
            flag = true;
            if (state.conversation[a].key < 0) {
                const oldKey = Number(state.conversation[a].key);
                if (oldKey === Number(state.activePerson.key)) {
                    state.activePerson.key = message.key;
                }
                state.conversation[a].key = message.key;
                for (let messageList of state.messageList) {
                    if (oldKey === Number(messageList.key)) {
                        messageList.key = message.key;
                        break;
                    }
                }
            }
        }

        for (let messageList of state.messageList) {
            let msgs = messageList.msgs;
            if (msgs.length === 0 ||
                Util.fiveMinutes(msgs[msgs.length - 1].ctime_ms, message.ctime_ms)) {
                payload.messages[0].time_show = 'today';
            }
            msgs.push(payload.messages[0]);
            break;
        }
        // 如果发送人不在会话列表里
        if (!flag) {
            addMessageUserNoConversation(state, payload, message);
        }
        state.newMessage = payload.messages[0];
    } else {
        // 自己发消息将消息添加到消息列表
        payload.msgs.ctime_ms = new Date().getTime();
        payload = isShowTime(state, payload);
        addMyselfMesssge(state, payload,global);
    }
}
// 添加自己发的消息到消息面板
function addMyselfMesssge(state = ChatStore, payload,global) {
    const result = state.conversation.filter((item) => {
        const single = item.type === 3;
        return single;
    });
    if (result.length === 0) { // 当前暂无会话
        payload.msgs.time_show = 'today';
        payload = isShowTime(state, payload);
        let flag = true;
        if (flag) {
            state.messageList.push({
                msgs: [payload.msgs],
                type: 3,
            });
            state.newMessage ={ ...payload.msgs,avatarUrl:global.avatarUrl};            
        }
    }else {
        for (let messageList of state.messageList) {
            let msgs = messageList.msgs;
            if (msgs.length === 0 ||
                Util.fiveMinutes(msgs[msgs.length - 1].ctime_ms, payload.msgs.ctime_ms)) {
                payload.msgs.time_show = 'today';
            }
            msgs.push(payload.msgs);
            state.newMessage ={ ...payload.msgs,avatarUrl:global.avatarUrl};
            break;
        }
    }
}
// 处理新消息
function filterNewMessage(state,payload,message) {
    // 更新imageViewer的数组
    const isImage = message.content.msg_type === 'image';
    if (isImage) {
        state.imageViewer.push({
            src: message.content.msg_body.media_url,
            width: message.content.msg_body.width,
            height: message.content.msg_body.height,
            msg_id: message.msg_id
        });
    }
}
function isShowTime(state, payload){
    // 判断消息是否要显示时间
    if (state.messageList.length === 0) {
        payload.time_show = Util.reducerDate(payload.ctime_ms);
    } else {
        const fiveMinutes =
            Util.fiveMinutes(state.messageList[state.messageList.length - 1].ctime_ms,
                payload.ctime_ms);
        if (fiveMinutes) {
            payload.time_show = Util.reducerDate(payload.ctime_ms);
        }
    }
    return payload;
}
// 新消息用户不在会话列表中
function addMessageUserNoConversation(state = ChatStore, payload, message) {
    let msg;
    let conversationItem;
    if (message.msg_type === 3) {
        msg = {
            key: message.key,
            msgs: [
                message
            ],
            draft: '',
            content: message.content,
            type: 3,
            name: message.content.name,
            appkey: message.content.appkey
        };
        conversationItem = {
            avatar: '',
            avatarUrl: message.content.avatarUrl,
            key: message.key,
            mtime: message.ctime_ms,
            name: message.content.name,
            nickName: message.content.nickName,
            type: 3,
            unreadNum: message.content.from_id !== global.user ? 1 : 0,
            noDisturb: false,
            extras: {}
        };
        for (let user of state.noDisturb.users) {
            if (user.username === message.content.name) {
                conversationItem.noDisturb = true;
                state.newMessageIsDisturb = true;
                break;
            }
        }
    } else {
        // 如果新消息没群名，从群列表中获取
        if (!message.content.target_name || message.content.target_name.length === 0) {
            for (let group of state.groupList) {
                if (Number(group.gid) === Number(message.key)) {
                    message.content.target_name = group.name;
                    break;
                }
            }
        }
        msg = {
            key: message.key,
            msgs: [
                message
            ],
            draft: '',
            content: message.content,
            type: 4
        };
        let avatarUrl;
        for (let group of state.groupList) {
            if (Number(group.gid) === Number(message.key)) {
                avatarUrl = group.avatarUrl;
                break;
            }
        }
        conversationItem = {
            avatar: '',
            avatarUrl: avatarUrl || '',
            key: message.key,
            mtime: message.ctime_ms,
            name: message.content.target_name,
            type: 4,
            unreadNum: message.content.from_id !== global.user ? 1 : 0,
            noDisturb: false,
            extras: {}
        };
        for (let group of state.noDisturb.groups) {
            if (Number(group.key) === Number(message.key)) {
                conversationItem.noDisturb = true;
                state.newMessageIsDisturb = true;
                break;
            }
        }
    }
    if (!conversationItem.noDisturb) {
        state.newMessageIsDisturb = false;
    }
    payload.messages[0].conversation_time_show = 'today';
    payload.messages[0].time_show = 'today';
    state.newMessage = msg;
    state.messageList.push(msg);
    const index = filterTopConversation(state, conversationItem);
    state.conversation[index].recentMsg = payload.messages[0];
    const atList = messageHasAtList(payload.messages[0].content.at_list);
    if (atList !== '') {
        state.conversation[index].atUser = atList;
    }
}

// 完成消息发送（失败或者成功）
function sendMsgComplete(state, payload) { //RoomStore
    for (let i = state.messageList.length - 1; i >= 0; i--) {
        if (payload.localMsg.msgKey === state.messageList[i].msgKey) {
            state.messageList[i].success = payload.localMsg.success;
            if (payload.msg) {
                let url;
                let loading;
                let extras;
                if (state.messageList[i].content.msg_body.media_url) {
                    url = state.messageList[i].content.msg_body.media_url;
                    loading = state.messageList[i].content.msg_body.loading;
                }
                if (state.messageList[i].content.msg_body.extras) {
                    extras = state.messageList[i].content.msg_body.extras;
                }
                state.messageList[i].content.msg_body = payload.msg.content.msg_body;
                if (url) {
                    state.messageList[i].content.msg_body.media_url = url;
                    state.messageList[i].content.msg_body.loading = loading;
                }
                if (extras) {
                    state.messageList[i].content.msg_body.extras = extras;
                }
            }
            break;
        }
    }
}