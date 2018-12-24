// 获取messageList avatar url
function getMemberAvatarUrl(info, callback) {
    let userArr = [];
    const msgs = info.messageList[info.active.activeIndex].msgs;
    const end = msgs.length - (info.loadingCount - 1) * pageNumber;
    ChatStore.chatAction =({
        type: 'getAllMessageSuccess',
        payload: info.messageList
    });
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
