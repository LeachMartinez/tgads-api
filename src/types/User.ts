import { type User } from '../db/models/User'

// type TUser = User

export type TJwtUser = Pick<User, 'login' | 'id' | 'email' | 'name'>
