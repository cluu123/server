const bcrypt = require('bcrypt');

const saltRounds = 10;
// const myPlaintextPassword = 'chenqi_uu_pwd';

module.exports = {
    bcryptPwd: pwd => bcrypt.hashSync(pwd, saltRounds),
    compilePwd: (pwd, hash) => bcrypt.compareSync(pwd, hash)
};
