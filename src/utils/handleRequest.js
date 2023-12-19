module.exports = (data, code, message) => ({
    code: code || 0,
    message: message || code ? message : 'success',
    data: data || null
});
