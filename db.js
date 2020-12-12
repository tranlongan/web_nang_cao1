const mysql = require('mysql');

const con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'db_web_nang_cao'
});
con.connect(function(err) {
    if (err) throw err;
    console.log('DB Connected!');
});

module.exports = con;