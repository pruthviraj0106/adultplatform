const bcrypt = require('bcryptjs');

const password = 'admin123';
bcrypt.hash(password, 12).then(hash => {
    console.log('Generated hash for password "admin123":');
    console.log(hash);
}); 