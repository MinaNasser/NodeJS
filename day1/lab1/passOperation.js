const bcrypt = require("bcrypt");
function hashPassword(password) {
    return bcrypt.hashSync(password, 10);
}
//hash password compare password function
function comparePassword(password, hash) {
    return bcrypt.compareSync(password, hash);
}

module.exports ={
    hashPassword,
    comparePassword
}



