const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

db.serialize(() => {
  // Alter accident table
  db.run(`ALTER TABLE accident ADD COLUMN work_type VARCHAR(50)`, (err) => {
    if (err) console.log("work_type column might already exist.");
    else console.log("Added work_type to accident.");
  });
  
  db.run(`ALTER TABLE accident ADD COLUMN hazard_code VARCHAR(50)`, (err) => {
    if (err) console.log("hazard_code column might already exist.");
    else console.log("Added hazard_code to accident.");
  });

  db.run(`ALTER TABLE accident ADD COLUMN contact_exposure_code VARCHAR(50)`, (err) => {
    if (err) console.log("contact_exposure_code column might already exist.");
    else console.log("Added contact_exposure_code to accident.");
  });

  db.run(`ALTER TABLE accident ADD COLUMN affectation_class_code VARCHAR(50)`, (err) => {
    if (err) console.log("affectation_class_code column might already exist.");
    else console.log("Added affectation_class_code to accident.");
  });

  db.run(`ALTER TABLE accident ADD COLUMN affectation_subject_code VARCHAR(50)`, (err) => {
    if (err) console.log("affectation_subject_code column might already exist.");
    else console.log("Added affectation_subject_code to accident.");
  });

  db.run(`ALTER TABLE accident ADD COLUMN assets_process_affectation VARCHAR(50)`, (err) => {
    if (err) console.log("assets_process_affectation column might already exist.");
    else console.log("Added assets_process_affectation to accident.");
  });

  // Alter employee_accident table
  db.run(`ALTER TABLE employee_accident ADD COLUMN affected_area VARCHAR(50)`, (err) => {
    if (err) console.log("affected_area column might already exist.");
    else console.log("Added affected_area to employee_accident.");
  });

  db.run(`ALTER TABLE employee_accident ADD COLUMN injury_nature VARCHAR(50)`, (err) => {
    if (err) console.log("injury_nature column might already exist.");
    else console.log("Added injury_nature to employee_accident.");
  });

  db.run(`ALTER TABLE employee_accident ADD COLUMN injury_level VARCHAR(50)`, (err) => {
    if (err) console.log("injury_level column might already exist.");
    else console.log("Added injury_level to employee_accident.");
  });

  db.run(`ALTER TABLE employee_accident ADD COLUMN injury_consequence VARCHAR(50)`, (err) => {
    if (err) console.log("injury_consequence column might already exist.");
    else console.log("Added injury_consequence to employee_accident.");
  });
});
