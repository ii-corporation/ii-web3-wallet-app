import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }),
    { logger: ['log', 'error', 'warn', 'debug', 'verbose'] },
  );

  const logger = new Logger('HTTP');

  // Log all incoming requests
  app.use((req: any, res: any, next: () => void) => {
    const { method, url, headers } = req;
    const authHeader = headers.authorization;
    const hasAuth = !!authHeader;
    const authPreview = authHeader ? `${authHeader.substring(0, 20)}...` : 'none';

    logger.log(`--> ${method} ${url} | Auth: ${hasAuth ? authPreview : 'none'}`);

    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      logger.log(`<-- ${method} ${url} ${res.statusCode} (${duration}ms)`);
    });

    next();
  });

  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global prefix
  app.setGlobalPrefix('api');

  const port = process.env.PORT ?? 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Backend running on http://localhost:${port}`);
}
bootstrap();
