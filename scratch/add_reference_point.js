const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  console.log("Running migration to add reference_point columns...");
  
  db.run(`ALTER TABLE employee ADD COLUMN reference_point VARCHAR(255)`, (err) => {
    if (err) {
      console.log("reference_point column in employee table might already exist or error:", err.message);
    } else {
      console.log("Added reference_point to employee table.");
    }
  });

  db.run(`ALTER TABLE facility ADD COLUMN reference_point VARCHAR(255)`, (err) => {
    if (err) {
      console.log("reference_point column in facility table might already exist or error:", err.message);
    } else {
      console.log("Added reference_point to facility table.");
    }
  });
});
db.close();
