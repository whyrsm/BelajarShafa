// Load .env FIRST before any other imports
import { config } from 'dotenv';
import { resolve } from 'path';
import { existsSync } from 'fs';

// Load .env from project root BEFORE importing AppModule
// When compiled: __dirname is server/dist/src/, so ../../../ goes to project root
// When in development: __dirname is server/src/, so ../../ goes to project root
const envPathFromDist = resolve(__dirname, '../../../.env');
const envPathFromSrc = resolve(__dirname, '../../.env');
const envPath = existsSync(envPathFromDist) ? envPathFromDist : 
                existsSync(envPathFromSrc) ? envPathFromSrc : 
                resolve(process.cwd(), '../.env');
config({ path: envPath });

// Now import NestJS modules after env is loaded
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors();
  
  // Enable validation pipe with transformation
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true,
    }),
  );
  
  await app.listen(process.env.PORT ?? 4000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
