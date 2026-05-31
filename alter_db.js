const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

db.serialize(() => {
  db.run("ALTER TABLE accident ADD COLUMN magnitude_id INTEGER;", (err) => {
    if (err) {
      if (err.message.includes("duplicate column name")) {
        console.log("Column magnitude_id already exists.");
      } else {
        console.error("Error adding column:", err);
      }
    } else {
      console.log("Column magnitude_id successfully added to table 'accident'!");
    }
  });
});
db.close();
