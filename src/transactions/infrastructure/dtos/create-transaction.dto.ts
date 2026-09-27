import { IsString, IsNotEmpty, IsNumber, IsObject, ValidateNested, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

class CustomerDataDto {
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  fullName: string;
}

class CardDataDto {
  @IsString()
  @IsNotEmpty()
  cardNumber: string;

  @IsString()
  @IsNotEmpty()
  cardHolder: string;

  @IsString()
  @IsNotEmpty()
  expiry: string;

  @IsString()
  @IsNotEmpty()
  cvc: string;

  @IsString()
  @IsNotEmpty()
  token: string;

  @IsNumber()
  @Min(1)
  installments: number;
}

class DeliveryDataDto {
  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  city: string;
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

  @IsObject()
  @ValidateNested()
  @Type(() => DeliveryDataDto)
  deliveryData: DeliveryDataDto;
}