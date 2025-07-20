const mysql = require('mysql');

const conn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "kalyani@2004",
  database: "irkdb"
});

conn.connect(err => {
  if (err) throw err;
  console.log("MySQL connected.");
});

module.exports = conn;
