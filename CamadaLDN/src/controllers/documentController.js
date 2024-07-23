const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const documentService = require('../services/documentService');

exports.uploadDocument = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }
  try {
    const mockerro = mockErros();

    setTimeout(async () => {
      console.log('Processando...');
      if (mockerro.error == false) {
        const documentId = await documentService.createDocument(
          req.file.originalname,
          req.file.buffer,
          req.file.mimetype
        );
        res
          .status(201)
          .json({ message: 'File uploaded successfully', documentId });
      } else {
        console.log(mockerro.error);
        res.status(500).json({ error: mockerro.error });
      }
    }, 4000);
  } catch (error) {
    setTimeout(() => {
      console.log('Processando...');
      res.status(500).json({ error: error.message });
    }, 4000);
  }
};

exports.getDocument = async (req, res) => {
  try {
    const mockerro = mockErros();

    setTimeout(async () => {
      console.log('Processando...');
      if (mockerro.error == false) {
        const document = await documentService.getDocumentById(req.params.id);
        if (!document) {
          res.status(400).json({ error: 'Document not found' });
        } else {
          res.status(200).send(document);
        }
      } else {
        res.status(500).json({ error: mockerro.error });
      }
    }, 4000);
  } catch (error) {
    setTimeout(() => {
      console.log('Processando...');
      res.status(500).json({ error: error.message });
    }, 4000);
  }
};

function mockErros() {
  const mockSucesso = Math.random() < 0.65;

  if (mockSucesso) {
    return { error: false };
  } else {
    const mockTimeout = Math.random() < 0.7;

    if (mockTimeout) {
      return { error: 'Timeout error occurred.' };
    } else {
      const mockErroInterno = Math.random() < 0.7;

      if (mockErroInterno) {
        return { error: 'Unexpected internal error.' };
      } else {
        return { error: 'Error accessing ECM.' };
      }
    }
  }
}
