import { prisma } from '../lib/prisma.js';
import { createFeedbackSchema } from '../schemas/feedback.schema.js';

export const createFeedback = async (req, res, next) => {
  try {
    const projectId = Number(req.params.id);
    const { comment, rating } = createFeedbackSchema.parse(req.body);

    // Salva o novo feedback
    await prisma.feedback.create({
      data: { comment, rating, projectId },
    });

    // Recalcula a nota média
    const feedbacks = await prisma.feedback.findMany({ where: { projectId } });
    const totalRating = feedbacks.reduce((acc, curr) => acc + curr.rating, 0);
    const averageRating = totalRating / feedbacks.length;

    // Atualiza a nota média no projeto
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: { averageRating: parseFloat(averageRating.toFixed(2)) },
      include: { feedbacks: true },
    });

    return res.status(201).json(updatedProject);
  } catch (err) {
    next(err);
  }
};