var ChatStore={
    conversation: [],
    activePerson: {
        key: string,
        name: string,
        nickName: string,
        activeIndex: number,
        noDisturb: boolean,
        avatarUrl?: string,
        type?: number,
        shield: boolean,
        memo_name: string,
        appkey: string
    },
    messageList: [],
    newMessage:null,
    chatAction:null
}