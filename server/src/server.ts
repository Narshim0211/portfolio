import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import { connectToDatabase } from './config/db';
import { env } from './config/env';
import { notFound } from './middleware/notFound';
import { errorHandler } from './middleware/errorHandler';

async function bootstrap(): Promise<void> {
  await connectToDatabase();

  const app = express();
  app.use(helmet());
  app.use(cors({ origin: env.appBaseUrl, credentials: true }));
  app.use(morgan('dev'));
  app.use(express.json());
  app.use(cookieParser());
  app.use(compression());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // TODO: mount routers here

  app.use(notFound);
  app.use(errorHandler);

  app.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`API listening on port ${env.port}`);
  });
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start server', err);
  process.exit(1);
});
