import express from 'express';
import { router as apiRouter } from './api.router';
import dotenv from 'dotenv';

const app = express();
const port = 5050; // Porta em que o servidor irá rodar
dotenv.config();

app.use(express.json()); // Middleware para parsear JSON

// Usando o router configurado no api.router.ts
app.use('/', apiRouter);

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
