import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('TranAPI')
    .setDescription(
      'Promoting introversion as a way to speed up the development process',
    )
    .setVersion('0.1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  //enable cors
  app.enableCors();

  SwaggerModule.setup('api', app, document);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      // disableErrorMessages: true,
      // forbidNonWhitelisted: true,
    }),
  );
  // await app.listen(process.env.PORT || 3030, 'localhost');
  await app.listen(process.env.PORT || 3030);
}

bootstrap();
