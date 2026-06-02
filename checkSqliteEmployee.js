const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

db.all("PRAGMA table_info(employee_accident)", (err, rows) => {
  if (err) {
    console.error(err);
  } else {
    console.log("employee_accident columns in SQLite:");
    console.table(rows);
  }
  db.close();
});
