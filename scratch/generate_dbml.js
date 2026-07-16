const fs = require('fs');
const path = require('path');
const models = require('../src/models');
const { sequelize } = models;

function getDbmlType(sequelizeTypeStr) {
  let t = sequelizeTypeStr.toLowerCase();
  // Clean up common types for DBML readability
  if (t.includes('varchar')) return t;
  if (t === 'datetime') return 'datetime';
  if (t === 'tinyint(1)' || t === 'boolean') return 'boolean';
  if (t.includes('integer')) return 'integer';
  if (t.includes('string')) return 'varchar(255)';
  return t;
}

function generate() {
  let dbml = '';
  
  // Get all models
  const modelNames = Object.keys(sequelize.models);
  
  // Sort models alphabetically to be clean
  modelNames.sort();

  for (const modelName of modelNames) {
    const model = sequelize.models[modelName];
    const tableName = model.tableName;
    
    dbml += `Table ${tableName} {\n`;
    
    const printedColumns = new Set();
    
    for (const [attrName, attr] of Object.entries(model.rawAttributes)) {
      const columnName = attr.field || attrName;
      
      // Skip if column already printed (e.g. due to association field mappings)
      if (printedColumns.has(columnName)) continue;
      printedColumns.add(columnName);
      
      const typeStr = getDbmlType(attr.type.toString());
      
      const details = [];
      if (attr.primaryKey) details.push('primary key');
      if (attr.autoIncrement) details.push('increment');
      if (attr.unique) details.push('unique');
      if (attr.allowNull === false) details.push('not null');
      
      if (attr.defaultValue !== undefined && typeof attr.defaultValue !== 'function') {
        let defVal = attr.defaultValue;
        if (typeof defVal === 'string') {
          defVal = `'${defVal}'`;
        } else if (typeof defVal === 'object' && defVal !== null) {
          defVal = JSON.stringify(defVal);
        }
        details.push(`default: ${defVal}`);
      }
      
      const detailsStr = details.length > 0 ? ` [${details.join(', ')}]` : '';
      dbml += `  ${columnName} ${typeStr}${detailsStr}\n`;
    }
    
    dbml += `}\n\n`;
  }
  
  // Add associations
  dbml += `// --- Relationships ---\n`;
  
  const relationships = [];
  for (const modelName of modelNames) {
    const model = sequelize.models[modelName];
    for (const assocName of Object.keys(model.associations)) {
      const association = model.associations[assocName];
      if (association.associationType === 'BelongsTo') {
        const sourceTable = model.tableName;
        const targetTable = association.target.tableName;
        const foreignKey = association.foreignKey;
        const targetKey = association.targetKey || 'id';
        relationships.push(`Ref: ${sourceTable}.${foreignKey} > ${targetTable}.${targetKey}`);
      }
    }
  }
  
  // Deduplicate and sort relationships
  const uniqueRelationships = Array.from(new Set(relationships)).sort();
  dbml += uniqueRelationships.join('\n') + '\n';
  
  const outputPath = path.join(__dirname, 'generated_db_schema.dbml');
  fs.writeFileSync(outputPath, dbml);
  console.log(`Generated DBML saved to: ${outputPath}`);
}

generate();
process.exit(0);
