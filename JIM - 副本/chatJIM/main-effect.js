// 创建单聊/添加好友
function createSingleChatAction(singleName) {
    const userObj = {
        username: singleName
    };
    apiService.getUserInfo(userObj).then((data) => {
        if (data.code) {
            if (data.code === 882002) {
                this.store$.dispatch({
                    type: mainAction.createSingleChatShow,
                    payload: {
                        show: true,
                        info: '用户不存在'
                    }
                });
            } else {
                this.errorFn(data);
            }
        } else {
            const user = data.user_info;
            const item = {
                avatar: user.avatar,
                mtime: user.mtime,
                name: user.username,
                nickName: user.nickname,
                username: user.username,
                nickname: user.nickname,
                type: 3,
                signature: user.signature,
                gender: user.gender,
                region: user.region,
                avatarUrl: '',
                // infoType: info.type
            };
            if (item.avatar !== '') {
                const urlObj = {
                    media_id: data.user_info.avatar
                };
                apiService.getResource(urlObj).then((urlInfo) => {
                    if (urlInfo.code) {
                        item.avatarUrl = '';
                    } else {
                        item.avatarUrl = urlInfo.url;
                    }
                });
            }
            return item;
        }
    })
}