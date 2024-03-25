import { StringSession } from 'telegram/sessions'
import { Api, TelegramClient } from 'telegram'
import { AppDataSource } from '../../db/data-source'
import { TelegramSession } from '../../db/models/TelegramSession'
import { type Repository } from 'typeorm'
import { TelegramChannel } from '../../db/models/TelegramChannel'

export default class Telegram {
  protected API_ID = Number(process.env.TG_API_ID)
  protected API_HASH = process.env.TG_API_HASH ?? ''
  protected tgSessionRep: Repository<TelegramSession>
  protected tgChannelRep: Repository<TelegramChannel>
  protected userId: number | undefined
  protected stringSession: StringSession
  protected session: string
  protected client: TelegramClient
  private static readonly tgChannelRep = AppDataSource.getRepository(TelegramChannel)
  private static readonly tgSessionRep = AppDataSource.getRepository(TelegramSession)

  constructor (userId?: number, session?: string) {
    this.tgSessionRep = AppDataSource.getRepository(TelegramSession)
    this.tgChannelRep = AppDataSource.getRepository(TelegramChannel)
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

  async getChannel (channelId: number) {
    const channel = await this.tgChannelRep.findOneBy({ id: channelId })
    return channel
  }

  static async getUserSession (userId: number): Promise<string> {
    const tgSession = await this.tgSessionRep.findOneBy({
      user: {
        id: userId
      }
    })

    return tgSession?.session ?? ''
  }
}
