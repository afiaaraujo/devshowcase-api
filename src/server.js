import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use(cors());

// Rota de saúde da API
app.get('/', (req, res) => {
  res.json({ message: 'API DevShowcase rodando com sucesso!' });
});

// ==========================================
// 1. ENDPOINTS DE PROFILES (/api/profiles)
// ==========================================

// Esquema de Validação (DTO) para Profile
const createProfileSchema = z.object({
  name: z.string().min(1, { message: 'O nome é obrigatório.' }),
  email: z.string().email({ message: 'Formato de e-mail inválido.' }),
  bio: z.string().optional(),
  githubUrl: z.string().url({ message: 'A URL do GitHub deve ser válida.' }),
});

// POST /api/profiles - Cadastrar Perfil com validação DTO
app.post('/api/profiles', async (req, res) => {
  try {
    const data = createProfileSchema.parse(req.body);
    const profile = await prisma.profile.create({ data });
    return res.status(201).json(profile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    return res.status(400).json({ error: 'Erro ao criar perfil. Verifique se o e-mail é único.' });
  }
});

// GET /api/profiles/:id - Buscar perfil por ID (Requisito da Etapa 1)
app.get('/api/profiles/:id', async (req, res) => {
  const { id } = req.params;
  const profile = await prisma.profile.findUnique({
    where: { id: Number(id) },
    include: { projects: true },
  });

  if (!profile) {
    return res.status(404).json({ error: 'Perfil não encontrado.' });
  }

  return res.json(profile);
});

// GET /api/profiles - Listar todos os perfis
app.get('/api/profiles', async (req, res) => {
  const profiles = await prisma.profile.findMany({
    include: { projects: true },
  });
  return res.json(profiles);
});

// ==========================================
// 2. ENDPOINTS DE TECHNOLOGIES (/api/technologies)
// ==========================================

// Esquema de Validação (DTO) para Technology
const createTechSchema = z.object({
  name: z.string().min(1, { message: 'O nome da tecnologia é obrigatório.' }),
});

// POST /api/technologies - Cadastrar tecnologia
app.post('/api/technologies', async (req, res) => {
  try {
    const data = createTechSchema.parse(req.body);
    const tech = await prisma.technology.create({ data });
    return res.status(201).json(tech);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    return res.status(400).json({ error: 'Tecnologia já cadastrada ou dados inválidos.' });
  }
});

// GET /api/technologies - Listar todas as tecnologias
app.get('/api/technologies', async (req, res) => {
  const technologies = await prisma.technology.findMany();
  return res.json(technologies);
});

// ==========================================
// 3. ENDPOINTS DE PROJECTS (/api/projects)
// ==========================================

// Esquema de Validação (DTO) para Project
const createProjectSchema = z.object({
  title: z.string().min(1, { message: 'O título do projeto é obrigatório.' }),
  description: z.string().min(1, { message: 'A descrição é obrigatória.' }),
  repositoryUrl: z.string().url({ message: 'A URL do repositório deve ser válida.' }),
  profileId: z.number().int({ message: 'O ID do perfil é obrigatório e deve ser inteiro.' }),
});

// POST /api/projects - Cadastrar projeto
app.post('/api/projects', async (req, res) => {
  try {
    const data = createProjectSchema.parse(req.body);
    const project = await prisma.project.create({ data });
    return res.status(201).json(project);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    return res.status(400).json({ error: 'Erro ao criar projeto. Verifique se o profileId existe.' });
  }
});

// GET /api/projects - Listar projetos
app.get('/api/projects', async (req, res) => {
  const projects = await prisma.project.findMany({
    include: {
      profile: true,
      technologies: true,
      feedbacks: true,
    },
  });
  return res.json(projects);
});

// Associar Tecnologia a um Projeto (N : N)
app.post('/api/projects/:projectId/technologies/:techId', async (req, res) => {
  const { projectId, techId } = req.params;
  try {
    const updatedProject = await prisma.project.update({
      where: { id: Number(projectId) },
      data: {
        technologies: {
          connect: { id: Number(techId) },
        },
      },
      include: { technologies: true },
    });
    return res.json(updatedProject);
  } catch (error) {
    return res.status(400).json({ error: 'Erro ao associar tecnologia ao projeto.' });
  }
});

// ==========================================
// 4. ENDPOINTS DE FEEDBACKS (/api/feedbacks)
// ==========================================

app.post('/api/feedbacks', async (req, res) => {
  try {
    const { comment, projectId } = req.body;
    const feedback = await prisma.feedback.create({
      data: { comment, projectId: Number(projectId) },
    });
    return res.status(201).json(feedback);
  } catch (error) {
    return res.status(400).json({ error: 'Erro ao cadastrar feedback.' });
  }
});

// Inicialização do Servidor
const PORT = 3333;
app.listen(PORT, () => {
  console.log(`🚀 Servidor DevShowcase rodando em http://localhost:${PORT}`);
});