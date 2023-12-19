const env = process.argv.includes('--dev') ? 'development' : 'production';

let config = {};
if (env === 'development') {
    config = require('./dev');
}
else {
    config = require('./pro');
}

module.exports = config;
