const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./database.sqlite");

// Consulta SQL para pasar a mayúsculas los nombres donde el ID sea 1, 2 o 3
const sql = `
    UPDATE vehicle_accessory 
    SET name = UPPER(name) 
    WHERE id IN (1, 2, 3)
`;

db.run(sql, function (err) {
  if (err) {
    console.error("❌ Error al actualizar:", err.message);
  } else {
    console.log(`\n¡Éxito! 🎉 Se actualizaron ${this.changes} registros.`);
    console.log(`Los elementos con ID 1, 2 y 3 ahora están en MAYÚSCULAS.\n`);
  }
  db.close();
});
