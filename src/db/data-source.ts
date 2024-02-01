import { DataSource } from 'typeorm'
import { User } from './models/User'
import { AuthToken } from './models/AuthToken'
import { Telegram } from './models/Telegram'

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: '',
  database: 'tgads_development',
  synchronize: true,
  logging: true,
  entities: [User, AuthToken, Telegram],
  subscribers: [],
  migrations: []
})
