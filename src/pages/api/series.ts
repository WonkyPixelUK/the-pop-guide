import type { Request, Response } from 'express';

const series = [
  { id: 'star-wars', name: 'Star Wars' },
  { id: 'harry-potter', name: 'Harry Potter' },
  { id: 'marvel', name: 'Marvel' }
];

export default function handler(req: Request, res: Response) {
  if (req.method === 'GET') {
    res.status(200).json(series);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 