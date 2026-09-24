import express from 'express';
import cors from 'cors';
import { z } from 'zod';
import swaggerUi from 'swagger-ui-express';

import profileRoutes from './routes/profile.routes.js';
import projectRoutes from './routes/project.routes.js';
import techRoutes from './routes/tech.routes.js';

const app = express();

app.use(express.json());
app.use(cors());

// ==========================================
// DOCUMENTAÇÃO SWAGGER / OPENAPI (/docs)
// ==========================================
const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'DevShowcase API',
    version: '2.0.0',
    description: 'Documentação oficial da API DevShowcase - Etapa Final',
  },
  paths: {
    '/api/profiles': {
      post: { summary: 'Cadastrar perfil' },
      get: { summary: 'Listar perfis' },
    },
    '/api/projects': {
      get: { summary: 'Listar projetos com paginação e filtro por tecnologia' },
      post: { summary: 'Cadastrar projeto' },
    },
    '/api/projects/{id}/feedbacks': {
      post: { summary: 'Cadastrar feedback com nota (1 a 5) e recalcular nota média' },
    },
    '/api/projects/{id}/upvote': {
      put: { summary: 'Incrementar curtidas/estrelas do projeto' },
    },
  },
};

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// ==========================================
// Mapeamento das Rotas Modulares
// ==========================================
app.use('/api/profiles', profileRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/technologies', techRoutes);

app.get('/', (req, res) => {
  res.json({ 
    message: 'API DevShowcase rodando com sucesso!', 
    docs: 'Acesse /docs para visualizar o Swagger' 
  });
});

// ==========================================
// Tratamento Global de Exceções (Middleware)
// ==========================================
app.use((err, req, res, next) => {
  if (err instanceof z.ZodError) {
    return res.status(400).json({
      error: '400 Bad Request - Erro de Validação nos Dados Enviados',
      details: err.errors.map((e) => e.message),
    });
  }
  return res.status(500).json({ 
    error: '500 Internal Server Error - Erro interno no servidor.' 
  });
});

// Manipulador Global para Rotas Não Encontradas (404)
app.use((req, res) => {
  res.status(404).json({ 
    error: '404 Not Found - Rota ou recurso não encontrado.' 
  });
});

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📖 Documentação Swagger disponível em http://localhost:${PORT}/docs`);
});
