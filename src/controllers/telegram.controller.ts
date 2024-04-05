import { Body, Controller, Get, Param, Post, Res } from 'routing-controllers'
import TelegramConnection from '../services/telegram/connection.service'
import Telegram from '../services/telegram/telegram.service'
import TelegramChannels from '../services/telegram/channels.service'
import { type TTelegramChannel } from '../types/Telegram'
import TelegramStatistics from '../services/telegram/statistics.service'
import categories from '../services/telegram/categories'
import { Response } from 'express'

@Controller()
export class TelegramController {
  @Post('/telegram/code')
  async code (@Body() body: {
    phoneNumber: string
    userId: number
  }) {
    const telegram = new TelegramConnection()
    return await telegram.sendCode(body.phoneNumber)
  }

  @Post('/telegram/auth')
  async auth (@Body() body: {
    phoneCode: string
    userId: number
    phoneCodeHash: string
    session: string
  }) {
    const telegram = new TelegramConnection(body.session)
    return await telegram.auth('79321270292', body.phoneCode, body.phoneCodeHash)
  }

  @Get('/telegram/saved_channels/:userId')
  async savedChannels (@Param('userId') userId: string) {
    if (!userId) return 'no user'

    const session = await Telegram.getUserSession(Number(userId))
    const telegram = new TelegramChannels(session)

    return await telegram.getSavedUserChannels(Number(userId))
  }

  @Get('/telegram/stats/:channelId')
  async stats (@Param('channelId') channelId: string) {
    const ownerSession = await Telegram.getOwnerSession(Number(channelId))
    const stats = new TelegramStatistics(ownerSession, Number(channelId))

    return await stats.analyze()
  }

  @Get('/telegram/channels/:userId')
  async channels (@Param('userId') userId: string) {
    const session = await Telegram.getUserSession(Number(userId))
    const telegram = new TelegramChannels(session)

    return await telegram.getUserChannels()
  }

  @Post('/telegram/channels')
  async addChannels (@Body() { userId, channel }: { userId: number, channel: TTelegramChannel }, @Res() response: Response) {
    const session = await Telegram.getUserSession(userId)
    const telegram = new TelegramChannels(session)
    return await telegram.saveChannels(userId, channel)
  }

  @Get('/telegram/channel/:channelId')
  async channel (@Param('channelId') channelId: string) {
    const telegram = new TelegramChannels()
    return await telegram.getChannel(Number(channelId))
  }

  @Get('/telegram/categories')
  categories () {
    return categories
  }
}
