import { createHash } from 'node:crypto';

const SALT = process.env.IDEA_LAB_SALT || 'idea-lab-dev-salt';

/** sha256(salt + ip + user agent). The raw IP is never stored or logged. */
export function deviceHash(req: Request): string {
  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || req.headers.get('x-real-ip') || 'unknown';
  const ua = req.headers.get('user-agent') || '';
  return createHash('sha256').update(`${SALT}${ip}${ua}`).digest('hex');
}

export const DAILY_LIMIT = Number(process.env.DAILY_LIMIT || 3);
export const DAILY_TOKEN_BUDGET = Number(process.env.DAILY_TOKEN_BUDGET || 100_000);

/** Strips HTML tags and links, collapses whitespace, and caps length. */
export function sanitizeText(s: unknown, max = 200): string {
  if (typeof s !== 'string') return '';
  return s
    .replace(/<[^>]*>/g, ' ')
    .replace(/https?:\/\/\S+|www\.\S+/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

export function json(body: unknown, status = 200) {
  return Response.json(body, { status });
}

export const BUDGET_MESSAGE = 'Idea Lab is resting until tomorrow. You can still browse the Idea Bank.';
export const limitMessage = (projectType: string) => `You have used today’s ${DAILY_LIMIT} free ${projectType} generations. Try another category, or come back tomorrow.`;
