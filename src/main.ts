import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configDotenv } from 'dotenv';

async function bootstrap() {

  configDotenv();
  
  if(process.env.REST_PORT) {

    const app = await NestFactory.create(AppModule);

    await app.listen(process.env.REST_PORT, '0.0.0.0');
    console.log(`REST API running on http://0.0.0.0:${process.env.REST_PORT}}`);
  }
  else {
    console.log('undefined REST_PORT');
  }
  
}

bootstrap();
