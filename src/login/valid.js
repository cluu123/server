module.exports = {
    loginIhone: {
        iphone: {
            type: 'string',
            required: true,
            message: 'iphone is required'
        },
        signIdx: {
            type: 'string',
            required: true,
            message: '验证码输入错误'
        }
    },
    loginUid: {
        uid: {
            type: 'string',
            required: true,
            message: 'uid is required'
        },
        pwd: {
            type: 'string',
            required: true,
            message: 'pwd is required'
        }
    },
    signIphone: {
        uid: {
            type: 'string',
            required: true,
            message: 'uid is required'
        },
        iphone: {
            type: 'string',
            required: true,
            message: 'iphone is required'
        },
        signIdx: {
            type: 'string',
            required: true,
            message: '验证码输入错误'
        }
    },
    signUid: {
        uid: {
            type: 'string',
            required: true,
            message: 'uid is required'
        },
        pwd: {
            type: 'string',
            required: true,
            message: 'pwd is required'
        }
    }
};
