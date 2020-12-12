const mysql = require('mysql');

const con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'don_vi_hanh_chinh'
});
con.connect(function(err) {
    if (err) throw err;
    console.log('DB1 Connected!');
});

module.exports = con;