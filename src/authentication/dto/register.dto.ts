export class RegisterDto {
  email: string;
  name: string;
  password: string;
  address?: AddressDto;
}

export default RegisterDto;


export class AddressDto {
  street: string;
  city: string;
  country: string;
}