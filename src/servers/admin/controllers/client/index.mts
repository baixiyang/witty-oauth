import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  Put,
  Query,
  Required,
  Delete,
} from 'wittyna';
import { prismaClient } from '../../index.mjs';
import { Client, ClientType } from '@prisma/client';

@Controller('client')
export class ClientController {
  select = {
    id: true,
    desc: true,
    client_id: true,
    type: true,
  };
  @Post()
  async create(
    @Body()
    @Required()
    @Required('client_secret')
    @Required('redirect_uris')
    client: Client
  ) {
    // 只能组册普通客户端
    client.type = ClientType.NORMAL;
    return prismaClient.client.create({
      data: client,
      select: this.select,
    });
  }
  @Put()
  async update(@Body() @Required() @Required('id') client: Client) {
    // 只能组册普通客户端
    client.type = ClientType.NORMAL;
    return prismaClient.client.update({
      where: {
        id: client.id,
      },
      select: this.select,
      data: client,
    });
  }
  @Get(':id')
  async getOne(@Param('id') @Required() id: string) {
    return prismaClient.client.findUnique({
      where: {
        id: id,
      },
      select: this.select,
    });
  }
  @Get()
  async getList(
    @Query('currenPage') currentPage = 1,
    @Query('pageSize') pageSize = 10
  ) {
    return prismaClient.client.findMany({
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
      select: this.select,
    });
  }
  @Delete(':id')
  async delete(@Param('id') @Required() id: string) {
    return prismaClient.client.delete({
      where: {
        id: id,
      },
      select: this.select,
    });
  }
  @Post(':id/users')
  async addUsers(
    @Param('id') @Required() id: string,
    @Body('ids') @Required() ids: string[]
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
