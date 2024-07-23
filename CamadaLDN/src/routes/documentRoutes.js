const express = require('express');
const multer = require('multer');
const {
  uploadDocument,
  getDocument,
  updateDocument,
  deleteDocument,
} = require('../controllers/documentController');

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/upload', upload.single('file'), uploadDocument);
router.get('/:id', getDocument);

module.exports = router;
