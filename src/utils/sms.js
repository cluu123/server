const Core = require('@alicloud/pop-core');

const client = new Core({
    accessKeyId: 'LTAI5tLgpVWEQ8VP5uZAeGTv',
    accessKeySecret: 'KYnW9pZ4LCmOlT1G4UfdB5Nx0OXQvX',
    endpoint: 'https://dysmsapi.aliyuncs.com',
    apiVersion: '2017-05-25'
});

const requestOption = {
    method: 'POST',
    formatParams: false
};

module.exports = (iphone, code) => new Promise((res, jet) => {
    const params = {
        SignName: 'tot短信验证码',
        TemplateCode: 'SMS_462220132',
        PhoneNumbers: iphone,
        TemplateParam: `{code: ${code}}`
    };
    client.request('SendSms', params, requestOption).then(data => {
        res(data);
    }).catch(err => {
        jet(err);
    });
});
