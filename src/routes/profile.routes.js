import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'Rota de perfis funcionando' });
});

export default router;