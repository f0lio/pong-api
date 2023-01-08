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

  async searchByUsername(query: string, offset = 0, limit = 10) {
    const users = await this.prisma.user.findMany({
      where: {
        username: {
          contains: query,
        },
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
      skip: offset,
      take: limit,
    });
    return users;
  }

  async getFollowers(username: string) {
    return [];
  }

  async getFollowing(username: string) {
    return [];
  }

  async followUser(followerId: number, username: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        username,
      },
      select: {
        id: true,
      },
    });
    if (user.id === followerId) {
      throw new Error('You cannot follow yourself. Except if you need a hug');
    }

    const follow = await this.prisma.user.update({
      where: {
        id: followerId,
      },
      data: {
        following: {
          connectOrCreate: {
            where: {
              followerId_followingId: {
                followerId,
                followingId: user.id,
              },
            },
            create: {
              followingId: user.id,
            },
          },
        },
      },
    });
    return follow;
  }

  async unfollowUser(followerId: number, username: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        username,
      },
      select: {
        id: true,
      },
    });

    const unfollow = await this.prisma.user.update({
      where: {
        id: followerId,
      },
      data: {
        following: {
          delete: {
            followerId_followingId: {
              followerId,
              followingId: user.id,
            },
          },
        },
      },
    });

    return unfollow;
  }

  async followsUser(followerId: number, username: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        username,
      },
      select: {
        id: true,
      },
    });

    const follows = await this.prisma.user.findUnique({
      where: {
        id: followerId,
      },
      select: {
        following: {
          where: {
            followerId: followerId,
            followingId: user.id,
          },
        },
      },
    });

    return follows.following.length > 0;
  }
}
