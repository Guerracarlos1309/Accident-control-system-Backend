const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    unique: true
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING(70),
    allowNull: true,
    unique: true
  },
  firstName: {
    type: DataTypes.STRING(50),
    field: 'first_name'
  },
  lastName: {
    type: DataTypes.STRING(50),
    field: 'last_name'
  },
  password: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  status: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  lastLogin: {
    type: DataTypes.DATE,
    field: 'last_login'
  },
  roleId: {
    type: DataTypes.INTEGER,
    field: 'role_id'
  }

}, {
  tableName: 'users',
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

/**
 * Compare plain password with hashed password
 */
User.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = User;
