import { Body, Controller, Post, Get, Param } from 'witty-koa';
import { prismaClient } from '../../index';
import { User } from '@prisma/client';

@Controller('/oauth/user')
export class UserController {
  @Post()
  async createUser(@Body() user: User) {
    const insertedData = await prismaClient.user.create({
      data: user,
    });
    return insertedData;
  }
  @Get('/:id')
  async getUser(@Param('id') id: string) {
    console.log(id);
    // const insertedData = await prismaClient.user.create({
    //   data: user,
    // });
  }
}
