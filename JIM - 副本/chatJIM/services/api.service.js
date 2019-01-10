const apiService = {
    // 重置会话徽标未读数
    resetUnreadCount: function(conversationObj, success) {
        return new Promise((resolve) => {
            JIM.resetUnreadCount(conversationObj);
            if (success && success instanceof Function) {
                success();
            }
            resolve();
        });
    },
    init: function (initObj = {}, success, error, timeout) {
        return this.callback(JIM.init(initObj), success, error, timeout);
    },
    register: function (registerObj = {}, success, error, timeout) {
        return this.callback(JIM.register(registerObj), success, error, timeout);
    },
    getConversation: function (success, error, timeout) {
        return this.callback(JIM.getConversation(), success, error, timeout);
    },
    onMsgReceive: function (success, error, timeout) {
        return this.callback(JIM.onMsgReceive(), success, error, timeout);
    },
    getUserInfo: function (userInfoObj = {}, success, error, timeout) {
        return this.callback(JIM.getUserInfo(userInfoObj), success, error, timeout);
    },
    sendSingleMsg:function (singleMsg = {}, success, error, timeout) {
        return this.callback(JIM.sendSingleMsg(singleMsg), success, error, timeout);
    },
    sendSinglePic:function (singlePic = {}, success, error, timeout) {
        return this.callback(JIM.sendSinglePic(singlePic), success, error, timeout);
    },
    downloadThumbUserAvatar:function (myAvatar = {}, success, error, timeout) {
        return this.callback(JIM.downloadThumbUserAvatar(myAvatar), success, error, timeout);
    },
    
    // 获取资源地址
    getResource:function (resource = {}, success, error, timeout) {
        return this.callback(JIM.getResource(resource), success, error, timeout);
    },
    // 更新自己的信息
    updateSelfInfo:function (self = {}, success, error, timeout) {
        return this.callback(JIM.updateSelfInfo(self), success, error, timeout);
    },
    // 更新自己的头像
    updateSelfAvatar:function (selfAvatar = {}, success, error, timeout) {
        return this.callback(JIM.updateSelfAvatar(selfAvatar), success, error, timeout);
    },
    callback :function(obj, ...args){
        return new Promise((resolve) => {
            if (obj && obj.onSuccess) {
                obj.onSuccess((successData) => {
                    if (successData.code) {
                        delete successData.code;
                    }
                    if (args[0] && args[0] instanceof Function) {
                        args[0](successData);
                    }
                    resolve(successData);
                }).onFail((errorData) => {
                    if (args[1] && args[1] instanceof Function) {
                        args[1](errorData);
                    }
                    resolve(errorData);
                }).onTimeout(() => {
                    if (args[2] && args[2] instanceof Function) {
                        args[2]();
                    }
                    resolve(timeoutData);
                });
            }
        });
    }
}