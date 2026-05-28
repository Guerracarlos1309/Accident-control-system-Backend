const { Sequelize } = require('sequelize');
require('dotenv').config();

const isSqlite = process.env.DB_DIALECT === 'sqlite';

const sequelize = isSqlite
  ? new Sequelize({
      dialect: 'sqlite',
      storage: process.env.DB_STORAGE || './database.sqlite',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      define: {
        timestamps: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        hooks: {
          beforeSave: (instance) => {
            for (const key in instance.dataValues) {
              const value = instance.dataValues[key];
              if (typeof value === 'string') {
                const lowerKey = key.toLowerCase();
                const isExcluded = 
                  lowerKey.includes('password') || 
                  lowerKey.includes('email') || 
                  lowerKey.includes('url') || 
                  lowerKey.includes('image') || 
                  lowerKey.includes('file') || 
                  lowerKey.includes('token');
                
                if (!isExcluded) {
                  instance.dataValues[key] = value.toUpperCase();
                }
              }
            }
          }
        }
      }
    })
  : new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASSWORD || '',
      {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: process.env.DB_DIALECT || 'postgres',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        define: {
          timestamps: true,
          underscored: true, // Use snake_case for DB columns automatically
          createdAt: 'created_at',
          updatedAt: 'updated_at',
          hooks: {
            beforeSave: (instance) => {
              for (const key in instance.dataValues) {
                const value = instance.dataValues[key];
                if (typeof value === 'string') {
                  const lowerKey = key.toLowerCase();
                  // Lista de exclusión para no dañar datos sensibles
                  const isExcluded = 
                    lowerKey.includes('password') || 
                    lowerKey.includes('email') || 
                    lowerKey.includes('url') || 
                    lowerKey.includes('image') || 
                    lowerKey.includes('file') || 
                    lowerKey.includes('token');
                  
                  if (!isExcluded) {
                    instance.dataValues[key] = value.toUpperCase();
                  }
                }
              }
            }
          }
        }
      }
    );

module.exports = sequelize;
