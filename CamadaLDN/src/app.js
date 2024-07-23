require('dotenv').config();
const express = require('express');
const documentRoutes = require('./routes/documentRoutes');

const app = express();
const PORT = process.env.PORT;

app.use('/documents', documentRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
