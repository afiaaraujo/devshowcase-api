import { prisma } from '../lib/prisma.js';
import { createProjectSchema } from '../schemas/project.schema.js';

export const createProject = async (req, res, next) => {
  try {
    const data = createProjectSchema.parse(req.body);
    const project = await prisma.project.create({ data });
    return res.status(201).json(project);
  } catch (err) {
    next(err);
  }
};

export const getProjects = async (req, res, next) => {
  try {
    const { tech, page = 1, limit = 5 } = req.query;
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const whereClause = tech
      ? { technologies: { some: { name: { contains: String(tech), mode: 'insensitive' } } } }
      : {};

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where: whereClause,
        include: { profile: true, technologies: true, feedbacks: true },
        skip,
        take: limitNum,
      }),
      prisma.project.count({ where: whereClause }),
    ]);

    return res.json({
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      totalItems: total,
      data: projects,
    });
  } catch (err) {
    next(err);
  }
};

export const upvoteProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const project = await prisma.project.update({
      where: { id: Number(id) },
      data: { upvotes: { increment: 1 } },
    });
    return res.json(project);
  } catch (err) {
    return res.status(404).json({ error: '404 Not Found - Projeto não encontrado para upvote.' });
  }
};