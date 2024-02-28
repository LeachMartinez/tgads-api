import { StringSession } from 'telegram/sessions'
import { Api, TelegramClient } from 'telegram'
import { AppDataSource } from '../../db/data-source'
import { TelegramSession } from '../../db/models/TelegramSession'
import { type Repository } from 'typeorm'
import { TelegramChannel } from '../../db/models/TelegramChannel'

export default class Telegram {
  protected API_ID = Number(process.env.TG_API_ID)
  protected API_HASH = process.env.TG_API_HASH ?? ''
  protected telegramSessionRepository: Repository<TelegramSession>
  protected telegramChannelsRepository: Repository<TelegramChannel>
  protected userId: number
  protected stringSession: StringSession
  protected session: string
  protected client: TelegramClient
  private static readonly telegramChannelsRepository = AppDataSource.getRepository(TelegramChannel)
  private static readonly telegramSessionRepository = AppDataSource.getRepository(TelegramSession)

  constructor (userId: number, session?: string) {
    this.telegramSessionRepository = AppDataSource.getRepository(TelegramSession)
    this.telegramChannelsRepository = AppDataSource.getRepository(TelegramChannel)
    this.userId = userId
    this.session = session ?? ''
    this.stringSession = new StringSession(session ?? '')
    this.client = new TelegramClient(this.stringSession, this.API_ID, this.API_HASH, {
      connectionRetries: 5
    })
  }

  protected async getFullChannelByLink (link: string) {
    const result = await this.client.invoke(
      new Api.messages.CheckChatInvite({
        hash: link.split('+')[1]
      })
    )

    if (result.className === 'ChatInviteAlready') {
      return result.chat
    }
  }

  protected getFullChannelByLinks (links: string[]) {
    return links.map(async link => {
      return await this.client.invoke(
        new Api.messages.CheckChatInvite({
          hash: link.split('+')[1]
        })
      )
    })
  }

  static async getUserSession (userId: number): Promise<string> {
    const tgSession = await this.telegramSessionRepository.findOneBy({
      user: {
        id: userId
      }
    })

    return tgSession?.session ?? ''
  }
}
