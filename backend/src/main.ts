import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { dirname, join } from 'path';
import { existsSync, mkdirSync, readFileSync } from 'fs';
import { AppModule } from './app.module';

function ensureDatabaseDirectory(dbPath: string): void {
  const dir = dirname(dbPath);
  if (dir !== '.' && !existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

async function bootstrap() {
  const dbPath = process.env.DATABASE_PATH ?? 'db.sqlite';
  ensureDatabaseDirectory(dbPath);

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);

  const isProd = config.get<string>('NODE_ENV') === 'production';
  const corsOrigin =
    config.get<string>('CORS_ORIGIN') ??
    (isProd ? 'https://wishare-kqxq.onrender.com' : 'http://127.0.0.1:5173');

  app.enableCors({ origin: corsOrigin });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  if (isProd) {
    const indexPath = join(process.cwd(), 'frontend-dist', 'index.html');
    app.use((req, res, next) => {
      if (req.path.startsWith('/api')) {
        return next();
      }
      if (req.method !== 'GET') {
        return next();
      }
      if (existsSync(indexPath)) {
        res.type('html').send(readFileSync(indexPath, 'utf-8'));
      } else {
        next();
      }
    });
  }

  const port = config.get<number>('PORT', 3000);
  const host = config.get<string>('HOST', isProd ? '0.0.0.0' : '127.0.0.1');
  await app.listen(port, host);
  console.log(`Server running on http://${host}:${port}`);
}

bootstrap();
