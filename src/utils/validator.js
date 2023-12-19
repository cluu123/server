const Schema = require('async-validator').default;

module.exports = (descriptor, params) => {
    const validator = new Schema(descriptor);
    return validator.validate(params).then(res => res).catch(({ errors, fields }) => ({
        errors,
        fields
    }));
};
