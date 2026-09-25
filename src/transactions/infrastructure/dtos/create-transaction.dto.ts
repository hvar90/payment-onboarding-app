import { IsString, IsEmail, IsNotEmpty, IsObject, ValidateNested, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

class CustomerDataDto {
  @IsEmail({}, { message: 'El correo electrónico debe ser válido' })
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  fullName: string;
}

class CardDataDto {
  @IsString()
  @IsNotEmpty()
  token: string; // Token de la tarjeta de crédito o método de pago

  @IsInt()
  @Min(1)
  @Max(36)
  installments: number; // Número de cuotas permitidas
}

export class CreateTransactionDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsObject()
  @ValidateNested()
  @Type(() => CustomerDataDto)
  customerData: CustomerDataDto;

  @IsObject()
  @ValidateNested()
  @Type(() => CardDataDto)
  cardData: CardDataDto;
}