import { z } from 'zod';

export const createFeedbackSchema = z.object({
  comment: z.string().min(1, 'Comentário é obrigatório'),
  rating: z.number().min(1, 'Nota mínima é 1').max(5, 'Nota máxima é 5'),
});