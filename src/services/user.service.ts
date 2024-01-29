import { validate } from 'class-validator'
import { User } from '../db/models/User'
import { AuthorizationService } from './authorization.service'
import { getLogger } from 'log4js'
import { AppDataSource } from '../db/data-source'
import { AuthToken } from '../db/models/AuthToken'
import { type Repository } from 'typeorm'

export class UserService {
  private readonly userRepository: Repository<User>
  private readonly tokenRepository: Repository<AuthToken>

  constructor () {
    this.userRepository = AppDataSource.getRepository(User)
    this.tokenRepository = AppDataSource.getRepository(AuthToken)
  }

  async register (user: Omit<User, 'id'>) {
    const findedUser = await this.userRepository.find({
      where: [
        { login: user.login },
        { email: user.email }
      ]
    })

    if (findedUser.length > 0) return 'Пользователь уже зарегистрирован!'

    const newUser = new User()
    newUser.email = user.email
    newUser.login = user.login
    newUser.name = user.name
    newUser.password = AuthorizationService.hashPassword(user.password)

    const errors = await validate(newUser)

    if (errors.length > 0) {
      getLogger().warn('Новый пользователь не зарегистрировался, валидация не пройдена', errors.flatMap(err => ({ error: err.constraints, target: err.property, value: err.value })))
      return errors.flatMap(err => ({ error: err.constraints, target: err.property }))
    }

    const createdUser = await this.userRepository.save(newUser)
    const tokens = new AuthorizationService().generateToken({ ...createdUser })

    await this.tokenRepository.save({
      refreshToken: tokens.refreshToken,
      user: {
        id: createdUser.id
      }
    })

    return tokens
  }

  async auth (body: Pick<Partial<User>, 'email' | 'password' | 'login'>) {
    return 'Ok'
  }
}
