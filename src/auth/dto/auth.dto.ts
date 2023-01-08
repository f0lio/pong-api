import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEmail, IsString, IsOptional } from 'class-validator';

class AuthDto {
  @IsNotEmpty()
  @IsString()
  password: string;
}

export class SignupDto extends AuthDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  first_name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  last_name: string;

  // @ApiProperty({ required: false })
  // @IsOptional()
  // @IsNotEmpty()
  // @IsString()
  // middle_name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  avatar_url: string;
}

// If both exist, priority is given to E-mail
export class SigninDto extends AuthDto {
  @ApiProperty({
    required: true,
    description: 'If username is provided, the email can be omitted',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'If email is provided, the username can be omitted',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Username should contain at least 3 characters' })
  username: string;
}

// quick (lazy) fix for swagger
export class AccessTokenDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  access_token: string;
}
