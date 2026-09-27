import { Inject, Injectable } from '@nestjs/common';
import { ICustomerRepository } from '../../domain/customer.repository.interface';
import { CustomerModel } from '../../domain/customer.model';

@Injectable()
export class FindOrCreateCustomerUseCase {
  constructor(
    @Inject(ICustomerRepository)
    private readonly customerRepository: ICustomerRepository,
  ) {}

  async execute(params: {
    name: string;
    email: string;
    phone: string;
  }): Promise<CustomerModel> {
    // 1. Buscar si ya existe por email o documento 
    let customer = await this.customerRepository.findByEmail(params.email);

    // 2. Si no existe, crearlo
    if (!customer) {
      customer = new CustomerModel(
        Date.now().toString(),
        params.name,
        params.email,
        new Date(),
      );
      customer = await this.customerRepository.save(customer);
    }

    return customer;
  }
}