import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  Put,
  Required,
  Query,
  Delete,
} from 'wittyna';
import { prismaClient } from '../../index.mjs';
import { UserRole, User } from '@prisma/client';
import { sha256 } from '../../../../utils/encrypt.mjs';

@Controller('user')
export class UserController {
  select = { id: true, username: true, email: true, roles: true };
  @Post()
  async createUser(@Body() @Required() @Required('password') user: User) {
    // 只能组册普通用户
    user.roles = [UserRole.USER];
    return prismaClient.user.create({
      data: user,
      select: this.select,
    });
  }
  @Put()
  async updateUser(@Body() @Required() @Required('id') user: User) {
    // 只能组册普通用户
    user.roles = [UserRole.USER];
    if (user.password) {
      user.password = sha256(user.password);
    }
    return prismaClient.user.update({
      where: {
        id: user.id,
      },
      select: this.select,
      data: user,
    });
  }
  @Get(':id')
  async getUser(@Param('id') @Required() id: string) {
    return prismaClient.user.findUnique({
      where: {
        id: id,
      },
      select: this.select,
    });
  }
  @Get()
  async getList(
    @Query('currentPage') currentPage = 1,
    @Query('pageSize') pageSize = 10
  ) {
    return prismaClient.user.findMany({
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
      select: this.select,
    });
  }
  @Delete(':id')
  async delete(@Param('id') @Required() id: string) {
    return prismaClient.user.delete({
      where: {
        id: id,
      },
      select: this.select,
    });
  }
  @Post(':id/clients')
  async addClients(
    @Param('id') @Required() id: string,
    @Body('ids') @Required() ids: string[]
  ) {
    return prismaClient.user.update({
      where: {
        id,
      },
      data: {
        clients: {
          connect: ids.map((id) => ({ id })),
        },
      },
    });
  }
}
