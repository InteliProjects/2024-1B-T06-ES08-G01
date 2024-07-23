const Sequelize = require('sequelize');
const sequelize = require('../config/db');

const Document = sequelize.define(
  'document',
  {
    title: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    file_data: {
      type: Sequelize.BLOB('long'),
      allowNull: false,
    },
    file_type: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  },
  {
    tableName: 'documents',
    timestamps: true, // Ativa o suporte a timestamps
    createdAt: 'created_at', // Especifica o nome da coluna para createdAt
    updatedAt: 'updated_at', // Especifica o nome da coluna para updatedAt
  }
);

module.exports = Document;
