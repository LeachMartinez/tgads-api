import { StringSession } from "telegram/sessions";
import { TelegramClient } from "telegram";
import { AppDataSource } from "../../db/data-source";
import { TelegramSession } from "../../db/models/TelegramSession";
import { Repository } from "typeorm";
import { TelegramChannel } from "../../db/models/TelegramChannel";

export default class Telegram {
  protected API_ID = Number(process.env.TG_API_ID)
  protected API_HASH = process.env.TG_API_HASH || ""
  protected telegramSessionRepository: Repository<TelegramSession>
  protected telegramChannelsRepository: Repository<TelegramChannel>
  protected userId: number
  protected stringSession: StringSession
  protected client: TelegramClient
  private static telegramChannelsRepository = AppDataSource.getRepository(TelegramChannel);
  private static telegramSessionRepository = AppDataSource.getRepository(TelegramSession);

  constructor(userId: number, session?: string) {
    this.telegramSessionRepository = AppDataSource.getRepository(TelegramSession);
    this.telegramChannelsRepository = AppDataSource.getRepository(TelegramChannel);
    this.userId = userId;
    this.stringSession = new StringSession(session || "")
    this.client = new TelegramClient(this.stringSession, this.API_ID, this.API_HASH, {
      connectionRetries: 5,
    })
  }

  static async getUserSession (userId: number): Promise<string> {
    const tgSession = await this.telegramSessionRepository.findOneBy({ user: {
      id: userId
    }})

    return tgSession?.session || "";
  }

  static async getSavedUserChannels(userId: number) {
    return await this.telegramChannelsRepository.findBy({
      user: { id: userId }
    });
  }
}
