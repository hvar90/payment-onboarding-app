import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductEntity } from '../entities/product.entity';

@Injectable()
export class ProductSeeder implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
  ) {}

  async onApplicationBootstrap() {
    const count = await this.productRepository.count();
    
    if (count === 0) {
      const initialProducts = [
        {
          name: 'Suscripción Premium Mensual',
          description: 'Acceso completo a herramientas avanzadas de desarrollo y pasarelas de pago.',
          price: 50000.00,
          stock: 15,
        },
        {
          name: 'Kit de Arquitectura Hexagonal Pro',
          description: 'Plantillas y guías avanzadas de diseño de software en TypeScript.',
          price: 120000.00,
          stock: 8,
        },
        {
          name: 'Consultoría Técnica FullStack',
          description: 'Sesión especializada en optimización de microservicios y bases de datos.',
          price: 250000.00,
          stock: 5,
        },
      ];

      await this.productRepository.save(initialProducts);
      console.log('📦 Base de datos sembrada con los productos iniciales correctamente.');
    }
  }
}