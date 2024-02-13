import { DataSource } from 'typeorm'
import { User } from './models/User'
import { AuthToken } from './models/AuthToken'
import { TelegramSession } from './models/TelegramSession'
import { TelegramChannel } from './models/TelegramChannel'

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: '',
  database: 'tgads_development',
  synchronize: true,
  logging: true,
  entities: [User, AuthToken, TelegramSession, TelegramChannel],
  subscribers: [],
  migrations: []
})
