import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { initAdapters } from './adapters.init';
import * as session from 'express-session';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(new ValidationPipe());
    app.enableCors();

    app.use(
        session({
          secret: 'rzxlszyykpbgqcflzxsqcysyhljt',
          resave: false,
          saveUninitialized: false,
        }),
      );
    // swagger
    const options = new DocumentBuilder()
        .setTitle('Video Call API')
        .setDescription('API cho Video Call')
        .setVersion('1.0')
        .addTag('video')
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('api', app, document);

    initAdapters(app);
    await app.listen(process.env.PORT || 3000);
    console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
