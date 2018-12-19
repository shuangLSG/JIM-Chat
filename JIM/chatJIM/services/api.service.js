const apiService = {
    init: function (initObj = {}, success, error, timeout) {
        return this.callback(JIM.init(initObj), success, error, timeout);
    },
    register: function (registerObj = {}, success, error, timeout) {
        return this.callback(JIM.register(registerObj), success, error, timeout);
    },
    getUserInfo: function (userInfoObj = {}, success, error, timeout) {
        return this.callback(JIM.getUserInfo(userInfoObj), success, error, timeout);
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