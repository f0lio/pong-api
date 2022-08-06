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
          firstName: true,
          middleName: true,
          lastName: true,
          email: true,
          avatar: true,
          createdAt: true,
        },
      });

      return user;
    } catch (error) {
      throw new NotFoundException(`User with username ${username} not found`);
    }
  }
}
