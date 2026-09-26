import { Inject, Injectable } from '@nestjs/common';
import { IDeliveryRepository } from '../../domain/delivery.repository.interface';
import { DeliveryModel } from '../../domain/delivery.model';

@Injectable()
export class CreateDeliveryUseCase {
  constructor(
    @Inject(IDeliveryRepository)
    private readonly deliveryRepository: IDeliveryRepository,
  ) {}

  async execute(params: {
    transactionId: string;
    address: string;
    city: string;
  }): Promise<DeliveryModel> {
    const delivery = new DeliveryModel(
      Date.now().toString(), 
      params.transactionId,
      params.address,
      params.city,
      'PREPARING',
      new Date(),
    );

    return await this.deliveryRepository.save(delivery);
  }
}