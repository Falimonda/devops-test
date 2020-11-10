var bcrypt = require('bcrypt');
let hash = bcrypt.hashSync("password1234",10);
console.log(hash);
