// 向上滚动加载更多消息
function scrollTopEvent() {
    if (!this.loadFlag) {
        return;
    }
    /**
     * this.loadingFlag
     * value    1           2           3
     * state 更多消息   正在加载消息  没有更多了
     */
    if (this.loadingFlag === 1 && this.msg.length >= pageNumber) {
        this.loadingFlag = 2;
        const oldContentHeight = this.componentScroll.directiveRef.geometry().h;
        const activeKey = this.active.key;
        this.loadingCount++;
        this.loadMore.emit({
            loadingCount: this.loadingCount
        });
        setTimeout(() => {
            if (activeKey !== this.active.key || !this.messageList[this.active.activeIndex]) {
                return;
            }
            this.componentScroll.directiveRef.update();
            this.componentScroll.directiveRef.scrollTo(0, 10);
            let msgs = this.messageList[this.active.activeIndex].msgs;
            if (msgs.length === this.msg.length) {
                this.loadingFlag = 3;
            } else {
                const oldLength = this.msg.length;
                if (msgs.length <= pageNumber * this.loadingCount) {
                    this.msg = msgs;
                    setTimeout(() => {
                        this.loadingFlag = 3;
                    });
                } else {
                    this.msg = msgs.slice(msgs.length - pageNumber * this.loadingCount);
                    setTimeout(() => {
                        this.loadingFlag = 1;
                    });
                }
                const newLength = this.msg.length;
                this.allPointerToMap(newLength - oldLength);
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        const newContentHeight = this.componentScroll.directiveRef.geometry().h;
                        const gap = newContentHeight - oldContentHeight;
                        this.componentScroll.directiveRef.scrollTo(0, gap);
                        resolve();
                    });
                }).catch(() => {
                    console.log('Promise Rejected');
                });
            }
        }, 500);
    }
}