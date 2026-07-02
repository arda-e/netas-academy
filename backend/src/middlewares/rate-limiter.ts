interface RateLimitConfig {
  max: number;
  interval: number;
}

const PATH_LIMITS: Record<string, RateLimitConfig> = {
  '/api/registrations/register': { max: 5, interval: 60_000 },
  '/api/contact-submissions/submit': { max: 5, interval: 60_000 },
  '/api/newsletter-subscriptions/subscribe': { max: 10, interval: 60_000 },
  '/api/course-applications/submit': { max: 5, interval: 60_000 },
  '/api/payments/iyzico/callback': { max: 20, interval: 60_000 },
  '/api/payments/iyzico/webhook': { max: 60, interval: 60_000 },
  '/api/analytics-events/capture': { max: 30, interval: 60_000 },
};

const DEFAULT_LIMIT: RateLimitConfig = { max: 60, interval: 60_000 };

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

const CLEANUP_INTERVAL = 5 * 60 * 1000;
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt <= now) {
      store.delete(key);
    }
  }
}, CLEANUP_INTERVAL).unref();

export default () => {
  return async (ctx: any, next: () => Promise<any>) => {
    const path = ctx.request.path;
    const config = PATH_LIMITS[path] ?? DEFAULT_LIMIT;
    const ip =
      ctx.request.headers['x-forwarded-for']?.toString().split(',')[0]?.trim() ??
      ctx.request.ip ??
      'unknown';
    const key = `${ip}:${path}`;
    const now = Date.now();

    const entry = store.get(key);

    if (entry && entry.resetAt > now) {
      if (entry.count >= config.max) {
        ctx.status = 429;
        ctx.body = {
          error: {
            message: 'Çok fazla istek gönderdiniz. Lütfen daha sonra teknik deneyin.',
            status: 429,
          },
        };
        return;
      }
      entry.count++;
    } else {
      store.set(key, { count: 1, resetAt: now + config.interval });
    }

    await next();
  };
};
