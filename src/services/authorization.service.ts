import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../db/data-source';
import { AuthToken } from '../db/models/AuthToken';
import { User } from '../db/models/User';
import { Repository } from 'typeorm';

export class AuthorizationService {
  private static saltRounds = 10;
  private static salt = bcrypt.genSaltSync(this.saltRounds)
  private authToken: Repository<AuthToken>

  public static hashPassword(password: string) {
    console.log(password);
    
    return bcrypt.hashSync(password, this.salt) as string;
  }

  constructor() {
    this.authToken = AppDataSource.getRepository(AuthToken)
  }

  generateToken(payload: Omit<User, "password">) {
    console.log(payload);
    
    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET!, {expiresIn: "2h"})
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, { expiresIn: "30d" });

    return {
      accessToken,
      refreshToken
    }
  }

  async validateAccessToken(token: string) {
    try {
      const userData = jwt.verify(token, process.env.JWT_ACCESS_SECRET!)
      return userData as Omit<User, "password">
    } catch (e) {
      return null;
    }
  }

  async validateRefreshToken(token) {
    try {
      let userData = jwt.verify(token, process.env.JWT_REFRESH_SECRET!)
      return userData as Omit<User, "password">
    } catch (e) {
      return null;
    }
  }

  async saveToken(userId: number, refreshToken: string) {
    const tokenData = await this.authToken.findOneBy({
      user: {
        id: userId
      }
    });

    if (tokenData) {
      tokenData.refreshToken = refreshToken;
      return await this.authToken.save(tokenData);
    }

    const token = await this.authToken.create({
      refreshToken,
      user: {
        id: userId
      }
    });

    return token
  }

  async removeToken(refreshToken: string) {
    return await this.authToken.delete({ refreshToken });
  }

  async findToken(refreshToken: string) {
    return await this.authToken.findOneBy({ refreshToken })
  }
}