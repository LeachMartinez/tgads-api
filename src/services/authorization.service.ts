import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { AppDataSource } from '../db/data-source'
import { AuthToken } from '../db/models/AuthToken'
import { type Repository } from 'typeorm'
import { type TJwtUser } from 'src/types/User'

export class AuthorizationService {
  private static readonly saltRounds = 10
  private static readonly salt = bcrypt.genSaltSync(this.saltRounds)
  private readonly authToken: Repository<AuthToken>
  private readonly JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? ''
  private readonly JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET ?? ''

  public static hashPassword (password: string): string {
    return bcrypt.hashSync(password, this.salt) as string
  }

  public static comparePassword (password: string, hash: string): boolean {
    return bcrypt.compareSync(password, hash)
  }

  constructor () {
    this.authToken = AppDataSource.getRepository(AuthToken)
  }

  generateToken (payload: TJwtUser, variant = 'all' as 'access' | 'all') {
    const accessToken = jwt.sign(payload, this.JWT_ACCESS_SECRET, { expiresIn: '1h' })
    const refreshToken = jwt.sign(payload, this.JWT_REFRESH_SECRET, { expiresIn: '30d' })

    if (variant === 'access') {
      return { accessToken }
    }

    return {
      accessToken,
      refreshToken
    }
  }

  async validateAccessToken (token: string): Promise<string | TJwtUser> {
    try {
      return jwt.verify(token, this.JWT_ACCESS_SECRET) as string | TJwtUser
    } catch (e) {
      return e
    }
  }

  async validateRefreshToken (token: string): Promise<TJwtUser | null> {
    try {
      const userData = jwt.verify(token, this.JWT_REFRESH_SECRET)
      return userData as TJwtUser
    } catch (e) {
      return null
    }
  }

  async saveToken (userId: number, refreshToken: string): Promise<AuthToken> {
    const tokenData = await this.authToken.findOneBy({
      user: {
        id: userId
      }
    })

    if (tokenData != null) {
      tokenData.refreshToken = refreshToken
      return await this.authToken.save(tokenData)
    }

    const token = this.authToken.create({
      refreshToken,
      user: {
        id: userId
      }
    })

    return token
  }

  async removeToken (refreshToken: string): Promise<void> {
    await this.authToken.delete({ refreshToken })
  }

  async findToken (refreshToken: string): Promise<AuthToken | null> {
    return await this.authToken.findOneBy({ refreshToken })
  }
}
