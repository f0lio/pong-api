import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { SigninDto, SignupDto } from './dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ApiBody } from '@nestjs/swagger';

@Injectable({})
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  // @ApiBody({ type: SignupDto })

  async signup(dto: SignupDto) {
    if (!/^[a-zA-Z0-9_]+$/.test(dto.username)) {
      throw new BadRequestException(
        'Username should contain only letters, numbers and underscore',
      );
    }
    try {
      const hash = await bcrypt.hash(dto.password, 10);
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash,
          username: dto.username,
          first_name: dto.first_name,
          last_name: dto.last_name,
          avatar_url: dto.avatar_url,
        },
        select: {
          id: true,
          email: true,
          created_at: true,
        },
      });
      return this.signToken(user);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        // already exists | see: https://www.prisma.io/docs/reference/api-reference/error-reference
        if (error.code === 'P2002')
          throw new ForbiddenException('Crendentials already exist');
        else throw error;
      }
    }
  }

  async signin(dto: SigninDto) {
    if (!dto.email && !dto.username)
      throw new ForbiddenException('missing e-mail and username');
    else if (!dto.password) throw new ForbiddenException('missing password');

    const user = dto.email
      ? await this.prisma.user.findFirst({
          where: {
            email: dto.email,
          },
        })
      : await this.prisma.user.findFirst({
          where: {
            username: dto.username,
          },
        });

    if (!user) throw new NotFoundException('User Not Found');
    // if (!user) throw new ForbiddenException('Invalid Password or Username');

    const correctPassword = await bcrypt.compare(dto.password, user.hash);
    if (correctPassword == false)
      throw new ForbiddenException('Invalid Password or Username');
    return this.signToken(user);
  }

  async signToken(user: any) {
    const payload = {
      id: user.id,
      email: user.email,
    };
    const access_token = await this.jwtService.signAsync(payload, {
      expiresIn: this.config.get('JWT_EXPIRATION_TIME'),
      secret: this.config.get('JWT_SECRET'),
    });
    return {
      access_token,
    };
  }
}
