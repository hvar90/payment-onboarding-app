import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ApiAdapter {
  private readonly apiUrl =
    process.env.PAYMENT_API_URL || 'https://api-sandbox.co.uat.wompi.dev/v1';
  private readonly privateKey =
    process.env.PAYMENT_PRIVATE_KEY ||
    'prv_stagtest_SiOZGIGIFcDQifYsXxvsny7Y37tKqFWg';

  async charge(data: {
    amountInCents: number;
    currency: string;
    customerEmail: string;
    paymentMethod: {
      type: string;
      installments: number;
      token: string;
    };
    reference: string;
  }) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/transactions`,
        {
          amount_in_cents: data.amountInCents,
          currency: data.currency,
          customer_email: data.customerEmail,
          payment_method: data.paymentMethod,
          reference: data.reference,
          acceptance_token: 'valid_acceptance_token',
        },
        {
          headers: {
            Authorization: `Bearer ${this.privateKey}`,
            'Content-Type': 'application/json',
          },
        },
      );
      return response.data.data;
    } catch (error) {
      const err = error as any;
      if (err.response && err.response.data) {
        throw new BadRequestException(err.response.data);
      }
      throw new InternalServerErrorException(
        'Error al conectar con la pasarela de pagos',
      );
    }
  }
}
