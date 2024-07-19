const {Client} = require('pg')

const client = new Client({
  host: 'localhost',
  user: 'postgres',
  database: 'postgres',
  password: '123456',
  
})

client.connect(function (err, data) {
    if (err) {
      //. DB not running on first boot
      console.log("no db on startup", err.code);
    } else {
      console.log("connected.");
      pg_client = data;
    }
  });

module.exports = client