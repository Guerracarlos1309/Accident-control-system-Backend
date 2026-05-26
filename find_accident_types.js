const fs = require('fs');
const path = 'c:/Users/usuario/OneDrive/Documentos/9no semestre/Sistema/Accident-control-system-FrontEnd/src/pages/Safety/Accidents/AccidentForm.jsx';

const content = fs.readFileSync(path, 'utf8');
const lines = content.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('accidentTypes')) {
    console.log(`${idx + 1}: ${line.trim()}`);
  }
});
