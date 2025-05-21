import { Router } from 'express';

const router = Router();

// Example route
router.get('/', (req, res) => {
  res.json({ message: 'Hello from the API root!' });
});

// You can add more API routes here later

export default router;
