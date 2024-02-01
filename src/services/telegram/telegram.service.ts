import { StringSession } from "telegram/sessions";
import { TelegramClient } from "telegram";

export default class Telegram {
  protected API_ID = Number(process.env.TG_API_ID)
  protected API_HASH = process.env.TG_API_HASH || ""
  private userId: number
  protected stringSession: StringSession
  protected client: TelegramClient

  constructor(userId: number, session?: string) {
    this.userId = userId
    session = session ? session : ""
    this.stringSession = new StringSession(session)    
    this.client = new TelegramClient(this.stringSession, this.API_ID, this.API_HASH, {
      connectionRetries: 5,
    })
  }

  getUserSession (user_id: number): string {
    return "";
  }
}
