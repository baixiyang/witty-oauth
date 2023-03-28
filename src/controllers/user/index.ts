import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  Put,
  ParamRequired,
  Query,
  Delete,
} from 'witty-koa';
import { prismaClient } from '../../index';
import { UserRole, User } from '@prisma/client';
import sha256 from 'crypto-js/sha256';

@Controller('/user')
export class UserController {
  select = { id: true, username: true, email: true, role: true };
  @Post()
  async createUser(
    @Body() @ParamRequired() @ParamRequired('password') user: User
  ) {
    // 只能组册普通用户
    user.role = UserRole.USER;
    return prismaClient.user.create({
      data: user,
      select: this.select,
    });
  }
  @Put()
  async updateUser(@Body() @ParamRequired() @ParamRequired('id') user: User) {
    // 只能组册普通用户
    user.role = UserRole.USER;
    if (user.password) {
      user.password = sha256(user.password).toString();
    }
    return prismaClient.user.update({
      where: {
        id: user.id,
      },
      select: this.select,
      data: user,
    });
  }
  @Get('/:id')
  async getUser(@Param('id') @ParamRequired() id: string) {
    return prismaClient.user.findUnique({
      where: {
        id: id,
      },
      select: this.select,
    });
  }
  @Get()
  async getList(@Query('pageNo') pageNo = 1, @Query('pageSize') pageSize = 10) {
    return prismaClient.user.findMany({
      skip: (pageNo - 1) * pageSize,
      take: pageSize,
      select: this.select,
    });
  }
  @Delete('/:id')
  async delete(@Param('id') @ParamRequired() id: string) {
    return prismaClient.user.delete({
      where: {
        id: id,
      },
      select: this.select,
    });
  }
  @Post('/:id/clients')
  async addClients(
    @Param('id') @ParamRequired() id: string,
    @Body('ids') @ParamRequired() ids: string[]
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
