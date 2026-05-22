import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

const app = new Hono();

app.use('*', logger());
app.use('*', cors({ origin: '*' }));

app.get('/', (c) => c.json({ service: 'AgriSence API', status: 'ok', version: '0.1.0' }));

app.get('/health', (c) => c.json({ status: 'healthy', timestamp: new Date().toISOString() }));

export default {
  port: Number(process.env.PORT) || 4000,
  fetch: app.fetch,
};
