import { Telegram } from "../db/models/Telegram"
import { User } from "../db/models/User"

type TUser = User
type TTelegram = Telegram

export type TJwtUser = Pick<User, "login" | "id" | "email" | "name">
