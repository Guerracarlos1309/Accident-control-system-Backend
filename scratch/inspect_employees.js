const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.all("SELECT id, personal_number, first_name, last_name, email, phone FROM employee", (err, rows) => {
  if (err) {
    console.error("Error fetching employees:", err);
    db.close();
    return;
  }
  
  console.log("Current employees in database:");
  console.table(rows);
  
  // Find duplicates or empty strings
  const emptyEmailRows = rows.filter(r => r.email === '');
  const emptyPhoneRows = rows.filter(r => r.phone === '');
  
  console.log(`Found ${emptyEmailRows.length} rows with empty string email.`);
  console.log(`Found ${emptyPhoneRows.length} rows with empty string phone.`);
  
  if (emptyEmailRows.length > 0 || emptyPhoneRows.length > 0) {
    db.serialize(() => {
      db.run("BEGIN TRANSACTION");
      
      db.run("UPDATE employee SET email = NULL WHERE email = ''", function(err) {
        if (err) console.error("Error updating empty emails:", err);
        else console.log(`Updated ${this.changes} empty email strings to NULL.`);
      });
      
      db.run("UPDATE employee SET phone = NULL WHERE phone = ''", function(err) {
        if (err) console.error("Error updating empty phones:", err);
        else console.log(`Updated ${this.changes} empty phone strings to NULL.`);
      });
      
      db.run("COMMIT", (err) => {
        if (err) {
          console.error("Error committing transaction:", err);
        } else {
          console.log("Transaction committed successfully.");
        }
        db.close();
      });
    });
  } else {
    db.close();
  }
});
