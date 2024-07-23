const db = require('../config/db');
const Document = require('../models/Document');

async function createDocument(title, fileData, fileType) {
  try {
    const document = await Document.create({
      title,
      file_data: fileData,
      file_type: fileType,
    });
    return document.id;
  } catch (error) {
    console.error('Failed to create document:', error);
    throw error;
  }
}

async function getDocumentById(id) {
  try {
    const document = await Document.findByPk(id);
    return document;
  } catch (error) {
    console.error('Failed to get document:', error);
    throw error;
  }
}

module.exports = {
  createDocument,
  getDocumentById,
};
