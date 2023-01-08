import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}
  async findOne(username: string) {
    try {
      const user = await this.prisma.user.findUniqueOrThrow({
        where: {
          username,
        },
        select: {
          id: true,
          username: true,
          first_name: true,
          last_name: true,
          email: true,
          avatar_url: true,
          cover_url: true,
          created_at: true,
        },
      });

      return user;
    } catch (error) {
      throw new NotFoundException(`User with username ${username} not found`);
    }
  }
}
