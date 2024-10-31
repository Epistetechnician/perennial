import { NextApiRequest, NextApiResponse } from 'next';

const MAPBOX_SECRET_TOKEN = process.env.MAPBOX_SECRET_TOKEN;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!MAPBOX_SECRET_TOKEN) {
    return res.status(500).json({ error: 'Mapbox secret token not configured' });
  }

  try {
    const { operation, params } = req.body;
    
    // Handle different operations that require secret token
    switch (operation) {
      // Add your secure operations here
      default:
        res.status(400).json({ error: 'Invalid operation' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}