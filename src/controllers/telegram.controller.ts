import 'reflect-metadata'
import { Authorized, Body, Controller, Get, Post, Req } from 'routing-controllers'
import TelegramConnection from '../services/telegram/connection.service'

@Controller()
export class TelegramController {
  @Post('/telegram/code')
  @Authorized()
  async code (@Body() body: {
    phoneNumber: string,
    userId: number
  }) {
    const telegram = new TelegramConnection(body.userId)
    return await telegram.sendCode(body.phoneNumber)
  }

  @Post('/telegram/auth')
  @Authorized()
  async auth (@Body() body: {
    phoneCode: string
    userId: number
    phoneCodeHash: string
    session: string
  }) {
    console.log(body);
    
    const telegram = new TelegramConnection(body.userId, body.session)
    return await telegram.auth("79321270292", body.phoneCode, body.phoneCodeHash)
  }

  @Get('/telegram/chats')
  async chats () {
    const telegram = new TelegramConnection(1, '1AgAOMTQ5LjE1NC4xNjcuNDEBu4VTeVeOTTEWGzFS/UakjUzO23EqeTYAfsP64uOeKGZoNWpdNviQO18Vxv0v3hfrefJr7IpUoBhwH1NFwKbr8igDjvxtJ4hnXvpSgrVsqr+d/9QHxvDR4K7+nmTUEsFI51dxk09DtP/CgRfMu08uvAOgMJE2fbsu/MSVXNK0Y3UjrFCJckP/eC+GD8foWtEKZCHB6QjH7ku2Bgo7A9LOu2oQAGEReTCQAV/wtGQ1b49jXtIrifyhVSX3Uz6m3PZMw/IIFwPPXiZjYKP5pu6tp9bKPyaJ7xVyv7/nKTEq2MAIxqkZg9kbYnsE/B500ZC9mcIf/p2vSY4pAG+9iBKrTl8=')
    return await telegram.getChats()
  }
}
