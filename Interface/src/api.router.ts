import { Router } from 'express';
import { readFile, createFile } from './api.controller';

export const router = Router();

// Rota que vai redirecionar para outro servidor
router.get('/readFile/:id', readFile);
router.post('/createFile', createFile);
