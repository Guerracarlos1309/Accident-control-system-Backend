const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Employee = sequelize.define('Employee', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    unique: true
  },
  personalNumber: {
    type: DataTypes.STRING(20),
    primaryKey: true,
    unique: true,
    field: 'personal_number'
  },
  idCard: {
    type: DataTypes.STRING(20),
    unique: true,
    allowNull: false,
    field: 'id_card'
  },
  firstName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'first_name'
  },
  lastName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'last_name'
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  gender: {
    type: DataTypes.CHAR(1),
    allowNull: true
  },
  birthDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'birth_date'
  },
  email: {
    type: DataTypes.STRING(70),
    unique: true,
    allowNull: true
  },
  status: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  maritalStatus: {
    type: DataTypes.INTEGER,
    field: 'marital_status'
  },
  dominantHand: {
    type: DataTypes.INTEGER,
    field: 'dominant_hand'
  },
  birthPlace: {
    type: DataTypes.STRING(100),
    field: 'birth_place'
  },
  homeAddress: {
    type: DataTypes.STRING(255),
    field: 'home_address'
  },
  educationLevel: {
    type: DataTypes.STRING(50),
    field: 'education_level'
  },
  hireDate: {
    type: DataTypes.DATEONLY,
    field: 'hire_date'
  },
    officePhone: {
      type: DataTypes.STRING(20),
      field: 'office_phone'
    },
    departmentId: {
      type: DataTypes.INTEGER,
      field: 'department_id'
    },
    jobTitleId: {
      type: DataTypes.INTEGER,
      field: 'job_title_id'
    },
    occupationId: {
      type: DataTypes.INTEGER,
      field: 'occupation_id'
    },
    imageUrl: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'image_url'
    }
  }, {
    tableName: 'employee',
    underscored: true
  });

module.exports = Employee;
