import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  Put,
  Query,
  ParamRequired,
  Delete,
} from 'witty-koa';
import { prismaClient } from '../../index';
import { Client, ClientType } from '@prisma/client';
import sha256 from 'crypto-js/sha256';

@Controller('/admin/client')
export class ClientController {
  select = {
    id: true,
    desc: true,
    client_id: true,
    type: true,
  };
  @Post()
  async create(
    @Body() @ParamRequired() @ParamRequired('client_secret') client: Client
  ) {
    // 只能组册普通客户端
    client.type = ClientType.NORMAL;
    client.client_secret = sha256(client.client_secret).toString();
    return prismaClient.client.create({
      data: client,
      select: this.select,
    });
  }
  @Put()
  async update(@Body() @ParamRequired() @ParamRequired('id') client: Client) {
    // 只能组册普通客户端
    client.type = ClientType.NORMAL;
    if (client.client_secret) {
      client.client_secret = sha256(client.client_secret).toString();
    }
    return prismaClient.client.update({
      where: {
        id: client.id,
      },
      select: this.select,
      data: client,
    });
  }
  @Get('/:id')
  async getOne(@Param('id') @ParamRequired() id: string) {
    return prismaClient.client.findUnique({
      where: {
        id: id,
      },
      select: this.select,
    });
  }
  @Get()
  async getList(@Query('pageNo') pageNo = 1, @Query('pageSize') pageSize = 10) {
    return prismaClient.client.findMany({
      skip: (pageNo - 1) * pageSize,
      take: pageSize,
      select: this.select,
    });
  }
  @Delete('/:id')
  async delete(@Param('id') @ParamRequired() id: string) {
    return prismaClient.client.delete({
      where: {
        id: id,
      },
      select: this.select,
    });
  }
  @Post('/:id/users')
  async addUsers(
    @Param('id') @ParamRequired() id: string,
    @Body('ids') @ParamRequired() ids: string[]
  ) {
    return prismaClient.client.update({
      where: {
        id,
      },
      data: {
        users: {
          connect: ids.map((id) => ({ id })),
        },
      },
    });
  }
}
