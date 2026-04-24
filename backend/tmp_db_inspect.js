const db = require('./config/db');
const pool = db.promise();
pool.query('SELECT * FROM fields ORDER BY id DESC LIMIT 5')
  .then(([rows]) => {
    console.log(JSON.stringify(rows, null, 2));
    process.exit(0);
  })
  .catch((err) => {
    console.error(err.message);
    process.exit(1);
  });