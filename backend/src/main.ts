import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { existsSync } from 'fs';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);

  const isProd = config.get<string>('NODE_ENV') === 'production';
  const jwtSecret = config.get<string>('JWT_SECRET')?.trim();
  if (isProd && !jwtSecret) {
    console.warn(
      'Warning: JWT_SECRET is not set. Using a default secret — set JWT_SECRET in Render env vars.',
    );
  }
  const corsOrigin =
    config.get<string>('CORS_ORIGIN') ??
    (isProd ? 'https://wishare-kqxq.onrender.com' : 'http://127.0.0.1:5173');

  app.enableCors({ origin: corsOrigin });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  if (isProd) {
    // Resolved from dist/main.js → backend/frontend-dist (works regardless of process cwd)
    const frontendDist = join(__dirname, '..', 'frontend-dist');
    const indexPath = join(frontendDist, 'index.html');

    if (!existsSync(indexPath)) {
      console.error(`Production frontend not found at ${frontendDist}`);
    } else {
      app.useStaticAssets(frontendDist);

      // SPA fallback: only for routes without a file extension (e.g. /dashboard, not /main-xxx.js)
      app.use((req, res, next) => {
        if (req.path.startsWith('/api') || req.method !== 'GET') {
          return next();
        }
        if (req.path.includes('.')) {
          return next();
        }
        res.sendFile(indexPath);
      });

      console.log(`Serving frontend from ${frontendDist}`);
    }
  }

  const port = config.get<number>('PORT', 3000);
  const host = config.get<string>('HOST', isProd ? '0.0.0.0' : '127.0.0.1');
  await app.listen(port, host);
  console.log(`Server running on http://${host}:${port}`);
}

bootstrap();
