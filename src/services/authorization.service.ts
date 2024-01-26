import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppDataSource } from 'src/db/data-source';
import { AuthToken } from 'src/db/models/AuthToken';
import { User } from 'src/db/models/User';
import { Repository } from 'typeorm';

export class AuthorizationService {
  private static saltRounds = 10;
  private static salt = bcrypt.genSaltSync(this.saltRounds)
  private authToken: Repository<AuthToken>

  public static hashPassword(password: string) {
    return bcrypt.hashSync(password, this.salt) as string;
  }

  constructor() {
    this.authToken = AppDataSource.getRepository(AuthToken)
  }

  generateToken(payload: Omit<User, "password">) {
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

  async saveToken(userId, refreshToken) {
    // const tokenData = await authToken.findOne({ where: { userId } });

    // if (tokenData) {
    //   tokenData.refreshToken = refreshToken;
    //   return await tokenData.save();
    // }

    // const token = await UserToken.create({ refreshToken, userId });

    // return token;
  }

  async removeToken(refreshToken) {
    // const tokenData = await UserToken.destroy({ where: { refreshToken } });
    // return tokenData;
  }

  async findToken(refreshToken) {
    // const tokenData = await UserToken.findOne({ where: { refreshToken } });
    // return tokenData;
  }
}