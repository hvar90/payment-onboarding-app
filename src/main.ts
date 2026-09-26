import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config'; 
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 2. Extraemos el ConfigService del contenedor de NestJS
  const configService = app.get(ConfigService);

  // 3. Leemos las URLs permitidas desde la variable de entorno (separadas por comas)
  // Si no existe la variable, por defecto permitimos localhost para desarrollo local
  const allowedOrigins = configService.get<string>('ALLOWED_ORIGINS') 
    ? configService.get<string>('ALLOWED_ORIGINS')!.split(',') 
    : ['http://localhost:5173', 'http://127.0.0.1:5173'];

  app.enableCors({
    origin: allowedOrigins,   // 4. Usamos la lista dinámica
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Elimina propiedades que no estén en el DTO
      forbidNonWhitelisted: true, // Lanza error si envían propiedades extrañas
      transform: true, // Transforma los tipos automáticamente (ej. string a number si es necesario)
    }),
  );

  const port = configService.get<number>('PORT') ?? 3000;
  await app.listen(port);
  console.log(`🚀 Backend corriendo en el puerto: ${port}`);
}
bootstrap();
