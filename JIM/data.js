// 会话列表
const now = new Date();
data = {
    sessions: [{
            id: 1,
            user: {
                name: '示例介绍',
                img: 'logo.png'
            },
            messages: [{
                content: 'Hello，这是一个基于Vue + Vuex + Webpack构建的简单chat示例，聊天记录保存在localStorge, 有什么问题可以通过Github Issue问我。',
                date: now
            }, {
                content: '项目地址: https://github.com/coffcer/vue-chat',
                date: now,
                self:true
            }]
        },
        {
            id: 2,
            user: {
                name: 'webpack',
                img: 'dist/images/3.jpg'
            },
            messages: []
        }
    ]
}