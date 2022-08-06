import { IsNotEmpty, IsEmail, IsString, IsOptional } from 'class-validator';

class AuthDto {
  @IsNotEmpty()
  @IsString()
  password: string;
}

export class SignupDto extends AuthDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  middleName: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  avatar: string;
}

// If both exist, priority is given to E-mail
export class SigninDto extends AuthDto {
  @IsOptional()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Username should contain at least 3 characters' })
  username: string;
}
