var messageList;
/**
 * 
 * @param {*} chatState 
 * @param {*} contactState 
 * chatState = {    actionType:'',
 *                  messageList:'',
 *                  activePerson:'',
 *                  newMessageIsActive:''
 *              }
 */
function stateChanged(chatState, contactState) {
    switch (chatState.actionType) {
        case chatAction.receiveMessageSuccess:
            this.messageList = chatState.messageList;
            if (chatState.activePerson.activeIndex >= 0 && chatState.newMessageIsActive) {
                let msg = chatState.messageList[chatState.activePerson.activeIndex].msgs;
                if (msg.length > pageNumber) {
                    this.msg = msg.slice(msg.length - this.msg.length);
                } else {
                    this.msg = msg;
                }
                // 经纬度转换成地图
                this.pointerToMap(chatState);
            }
            break;
    }
}
function updateMsg(chatState) {
    if (chatState.activePerson.activeIndex < 0) {
        return;
    }
    const list = chatState.messageList[chatState.activePerson.activeIndex];
    if (list.msgs.length > pageNumber) {
        this.msg = list.msgs.slice(list.msgs.length - this.msg.length);
    } else {
        this.msg = list.msgs;
    }
    this.messageList = chatState.messageList;
}

// 输入框keyup
function preKeyup(event) {
    if (this.active.type === 3) {
        // 单聊正在输入
        if (this.messageContent !== event.target.innerHTML) {
            this.messageContent = event.target.innerHTML;
            this.inputMessage.emit({
                type: 'input',
                content: {
                    message: this.messageContent
                }
            });
        }
        return;
    }
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    let groupSetting = this.messageList[this.active.activeIndex].groupSetting;
    let memberList;
    if (groupSetting) {
        memberList = groupSetting.memberList;
    }
    if (!groupSetting || !memberList) {
        return;
    }
    if (event.code === 'Digit2' && event.shiftKey) {
        this.showAtList(range, memberList, true);
    } else {
        const text = range.endContainer.nodeValue;
        const index = range.endOffset;
        let letter = '';
        let at = '';
        if (text) {
            letter = text.substring(index - 1, index).toUpperCase();
            if (letter !== '@') {
                at = text.substring(index - 2, index - 1);
                let hasAt = text.substring(0, index).lastIndexOf('@');
                if (at === '@') {
                    let newList = [];
                    this.filterNewList1(letter, newList, memberList);
                    this.atDeleteNum = 2;
                    if (newList.length > 0) {
                        this.showAtList(range, newList, false);
                    } else {
                        this.atList.show = false;
                    }
                } else if (hasAt !== -1) {
                    this.atDeleteNum = index - hasAt;
                    letter = text.substr(hasAt + 1, this.atDeleteNum - 1).toUpperCase();
                    let newList = [];
                    this.filterNewList2(letter, newList, memberList);
                    if (newList.length > 0) {
                        this.showAtList(range, newList, false);
                    } else {
                        this.atList.show = false;
                    }
                } else {
                    this.atList.show = false;
                }
            } else {
                this.atDeleteNum = 1;
                this.showAtList(range, memberList, true);
            }
        } else {
            if (event.keyCode !== 16) {
                this.atList.show = false;
            }
        }
    }
}