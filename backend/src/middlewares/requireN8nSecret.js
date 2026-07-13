import { timingSafeEqual } from 'node:crypto';
import { Buffer } from 'node:buffer';

export function createRequireN8nSecret(expected = process.env.N8N_SHARED_SECRET) {
  return function requireN8nSecret(request, response, next) {
    const received = request.get('X-Oriana-Secret');
    if (!expected || !received) return response.status(401).json({ error: 'UNAUTHENTICATED' });
    const left = Buffer.from(expected); const right = Buffer.from(received);
    if (left.length !== right.length || !timingSafeEqual(left, right)) {
      return response.status(401).json({ error: 'UNAUTHENTICATED' });
    }
    return next();
  };
}
