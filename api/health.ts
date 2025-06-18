// api/health.ts  (Node-style)
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function health(_req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
}
