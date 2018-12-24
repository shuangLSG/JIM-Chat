// 添加消息到消息列表
function addMessage(state= RoomStore, payload) {
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
    state.messageList.push(payload);
}

// 添加消息到消息面板
function addMessage(state= ChatStore, payload) {
    // 接收到别人的消息添加到消息列表/同步自己发送的消息
    if (payload.messages && payload.messages[0]) {
        let message = payload.messages[0];
        if (message.msg_type === 3) {
            const isMySelf = message.content.from_id !== global.user;
            message.content.name = isMySelf ? message.content.from_id : message.content.target_id;
            message.content.nickName =
                isMySelf ? message.content.from_name : message.content.target_name;
            message.content.appkey =
                isMySelf ? message.content.from_appkey : message.content.target_appkey;
        } else {
            message.content.name = message.content.from_id;
            message.content.nickName = message.content.from_name;
            message.content.appkey = message.content.from_appkey;
        }
        filterNewMessage(state, payload, message);
        let flag = false;
        // 如果发送人在会话列表里
        for (let a = 0; a < state.conversation.length; a++) {
            const groupMsg = message.msg_type === 4 && state.conversation[a].type === 4 &&
                Number(state.conversation[a].key) === Number(message.key);
            const singleMsg = message.msg_type === 3 && state.conversation[a].type === 3 &&
                state.conversation[a].name === message.content.name;
            if (groupMsg || singleMsg) {
                if (groupMsg && message.content.target_name === '') {
                    message.content.target_name = state.conversation[a].name;
                }
                const groupNoActive = message.msg_type === 4 &&
                    Number(state.activePerson.key) !== Number(message.key);
                const singleNoActive = message.msg_type === 3 &&
                    state.activePerson.name !== message.content.name;
                if (groupNoActive || singleNoActive) {
                    if (message.content.from_id !== global.user) {
                        if (!state.conversation[a].unreadNum) {
                            state.conversation[a].unreadNum = 1;
                        } else {
                            state.conversation[a].unreadNum++;
                        }
                    }
                    const atList = messageHasAtList(payload.messages[0].content.at_list);
                    if (atList !== '') {
                        state.conversation[a].atUser = atList;
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
                let index = a;
                if (!state.conversation[a].extras || !state.conversation[a].extras.top_time_ms) {
                    let item = state.conversation.splice(a, 1);
                    index = filterTopConversation(state, item[0]);
                }
                state.conversation[index].recentMsg = payload.messages[0];
                payload.messages[0].conversation_time_show = 'today';
                state.newMessageIsDisturb = state.conversation[index].noDisturb ? true : false;
                break;
            }
        }
        for (let messageList of state.messageList) {
            const groupMsg = message.msg_type === 4 && messageList.type === 4 &&
                Number(messageList.key) === Number(message.key);
            const singleMsg = message.msg_type === 3 && messageList.type === 3 &&
                messageList.name === message.content.name;
            if (groupMsg || singleMsg) {
                let msgs = messageList.msgs;
                if (msgs.length === 0 ||
                    Util.fiveMinutes(msgs[msgs.length - 1].ctime_ms, message.ctime_ms)) {
                    payload.messages[0].time_show = 'today';
                }
                msgs.push(payload.messages[0]);
                break;
            }
        }
        // 如果发送人不在会话列表里
        if (!flag) {
            addMessageUserNoConversation(state, payload, message);
        }
        state.newMessage = payload.messages[0];
    } else {
        // 自己发消息将消息添加到消息列表
        addMyselfMesssge(state, payload);
        // 清空会话草稿标志
        for (let conversation of state.conversation) {
            const single = payload.active.type === 3 && conversation.type === 3 &&
                payload.active.name === conversation.name;
            const group = payload.active.type === 4 && conversation.type === 4 &&
                Number(payload.active.key) === Number(conversation.key);
            if (single || group) {
                if (payload.msgs.content.msg_type === 'text') {
                    conversation.draft = '';
                }
                break;
            }
        }
    }
}
// 添加自己发的消息到消息面板
function addMyselfMesssge(state= ChatStore, payload) {
    const result = state.conversation.filter((item) => {
        const single = item.type === 3 && payload.active.type === 3 &&
            item.name === payload.active.name;
        const group = item.type === 4 && payload.active.type === 4 &&
            Number(item.key) === Number(payload.active.key);
        return single || group;
    });
    if (result.length === 0) {
        payload.active.extras = {};
        payload.msgs.conversation_time_show = 'today';
        payload.active.recentMsg = payload.msgs;
        let flag = true;
        for (let message of state.messageList) {
            const group = payload.active.type === 4 && message.type === 4 &&
                Number(payload.active.key) === Number(message.key);
            const single = payload.active.type === 3 && message.type === 3 &&
                payload.active.name === message.name;
            if (group || single) {
                message.msgs.push(payload.msgs);
                flag = false;
                break;
            }
        }
        if (flag && payload.active.type === 3) {
            state.messageList.push({
                msgs: [payload.msgs],
                type: 3,
                name: payload.active.name,
                appkey: payload.active.appkey || authPayload.appkey
            });
        } else if (flag && payload.active.type === 4) {
            state.messageList.push({
                msgs: [payload.msgs],
                type: 4,
                key: payload.active.key
            });
        }
        filterTopConversation(state, payload.active);
    } else {
        // 更新imageViewer的数组
        if (payload.msgs && payload.msgs.content.from_id === global.user
            && payload.msgs.content.msg_type === 'image') {
            const single = payload.active.type === 3 && state.activePerson.type === 3 &&
                payload.active.name === state.activePerson.name;
            const group = payload.active.type === 4 && state.activePerson.type === 4 &&
                Number(payload.active.key) === Number(state.activePerson.key);
            if (single || group) {
                state.imageViewer.push({
                    src: payload.msgs.content.msg_body.media_url,
                    width: payload.msgs.content.msg_body.width,
                    height: payload.msgs.content.msg_body.height,
                    msgKey: payload.msgs.msgKey
                });
            }
        }
        for (let messageList of state.messageList) {
            const single = payload.active.type === 3 && messageList.type === 3 &&
                messageList.name === payload.active.name;
            const group = messageList.type === 4 && payload.active.type === 4 &&
                Number(messageList.key) === Number(payload.key);
            if (single || group) {
                let msgs = messageList.msgs;
                if (msgs.length === 0 ||
                    Util.fiveMinutes(msgs[msgs.length - 1].ctime_ms, payload.msgs.ctime_ms)) {
                    payload.msgs.time_show = 'today';
                }
                msgs.push(payload.msgs);
                state.newMessage = payload.msgs;
                break;
            }
        }
        // 将当前会话放在第一位
        for (let a = 0; a < state.conversation.length; a++) {
            const group = payload.active.type === 4 && state.conversation[a].type === 4 &&
                Number(state.conversation[a].key) === Number(payload.key);
            const single = payload.active.type === 3 && state.conversation[a].type === 3 &&
                state.conversation[a].name === payload.active.name;
            if (group || single) {
                payload.msgs.conversation_time_show = 'today';
                if (payload.msgs.msg_type === 3) {
                    payload.msgs.unread_count = 1;
                }
                state.conversation[a].recentMsg = payload.msgs;
                if (!state.conversation[a].extras || !state.conversation[a].extras.top_time_ms) {
                    let item = state.conversation.splice(a, 1);
                    filterTopConversation(state, item[0]);
                }
                break;
            }
        }
    }
}

// 添加自己发的消息到消息面板
function addMyselfMesssge(state= ChatStore, payload) {
    const result = state.conversation.filter((item) => {
        const single = item.type === 3 && payload.active.type === 3 &&
            item.name === payload.active.name;
        const group = item.type === 4 && payload.active.type === 4 &&
            Number(item.key) === Number(payload.active.key);
        return single || group;
    });
    if (result.length === 0) {
        payload.active.extras = {};
        payload.msgs.conversation_time_show = 'today';
        payload.active.recentMsg = payload.msgs;
        let flag = true;
        for (let message of state.messageList) {
            const group = payload.active.type === 4 && message.type === 4 &&
                Number(payload.active.key) === Number(message.key);
            const single = payload.active.type === 3 && message.type === 3 &&
                payload.active.name === message.name;
            if (group || single) {
                message.msgs.push(payload.msgs);
                flag = false;
                break;
            }
        }
        if (flag && payload.active.type === 3) {
            state.messageList.push({
                msgs: [payload.msgs],
                type: 3,
                name: payload.active.name,
                appkey: payload.active.appkey || authPayload.appkey
            });
        } else if (flag && payload.active.type === 4) {
            state.messageList.push({
                msgs: [payload.msgs],
                type: 4,
                key: payload.active.key
            });
        }
        filterTopConversation(state, payload.active);
    } else {
        // 更新imageViewer的数组
        if (payload.msgs && payload.msgs.content.from_id === global.user
            && payload.msgs.content.msg_type === 'image') {
            const single = payload.active.type === 3 && state.activePerson.type === 3 &&
                payload.active.name === state.activePerson.name;
            const group = payload.active.type === 4 && state.activePerson.type === 4 &&
                Number(payload.active.key) === Number(state.activePerson.key);
            if (single || group) {
                state.imageViewer.push({
                    src: payload.msgs.content.msg_body.media_url,
                    width: payload.msgs.content.msg_body.width,
                    height: payload.msgs.content.msg_body.height,
                    msgKey: payload.msgs.msgKey
                });
            }
        }
        for (let messageList of state.messageList) {
            const single = payload.active.type === 3 && messageList.type === 3 &&
                messageList.name === payload.active.name;
            const group = messageList.type === 4 && payload.active.type === 4 &&
                Number(messageList.key) === Number(payload.key);
            if (single || group) {
                let msgs = messageList.msgs;
                if (msgs.length === 0 ||
                    Util.fiveMinutes(msgs[msgs.length - 1].ctime_ms, payload.msgs.ctime_ms)) {
                    payload.msgs.time_show = 'today';
                }
                msgs.push(payload.msgs);
                state.newMessage = payload.msgs;
                break;
            }
        }
        // 将当前会话放在第一位
        for (let a = 0; a < state.conversation.length; a++) {
            const group = payload.active.type === 4 && state.conversation[a].type === 4 &&
                Number(state.conversation[a].key) === Number(payload.key);
            const single = payload.active.type === 3 && state.conversation[a].type === 3 &&
                state.conversation[a].name === payload.active.name;
            if (group || single) {
                payload.msgs.conversation_time_show = 'today';
                if (payload.msgs.msg_type === 3) {
                    payload.msgs.unread_count = 1;
                }
                state.conversation[a].recentMsg = payload.msgs;
                if (!state.conversation[a].extras || !state.conversation[a].extras.top_time_ms) {
                    let item = state.conversation.splice(a, 1);
                    filterTopConversation(state, item[0]);
                }
                break;
            }
        }
    }
}


// 新消息用户不在会话列表中
function addMessageUserNoConversation(state=ChatStore, payload, message) {
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