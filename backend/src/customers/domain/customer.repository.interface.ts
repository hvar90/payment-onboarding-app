import { CustomerModel } from './customer.model';

export interface ICustomerRepository {
  findById(id: string): Promise<CustomerModel | null>;
  findByEmail(email: string): Promise<CustomerModel | null>;
  save(customer: CustomerModel): Promise<CustomerModel>;
}

export const ICustomerRepository = Symbol('ICustomerRepository');