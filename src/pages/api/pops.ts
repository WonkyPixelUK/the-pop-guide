import type { Request, Response } from 'express';

const pops = [
  {
    id: '1',
    name: 'Darth Vader',
    series: 'Star Wars',
    number: '01',
    image_url: 'https://example.com/darth-vader.png',
    value: 25.00
  },
  {
    id: '2',
    name: 'Harry Potter',
    series: 'Harry Potter',
    number: '10',
    image_url: 'https://example.com/harry-potter.png',
    value: 18.00
  }
];

export default function handler(req: Request, res: Response) {
  if (req.method === 'GET') {
    res.status(200).json(pops);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 