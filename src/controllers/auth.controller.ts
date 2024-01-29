import { Body, Controller, Get, Header, HeaderParam, Post, Res } from 'routing-controllers'
import { type User } from '../db/models/User'
import { UserService } from '../services/user.service'
import { Response } from 'express'

@Controller()
export class AuthController {
  private readonly userService: UserService

  constructor () {
    this.userService = new UserService()
  }

  @Post('/sign_in')
  async signIn (@Body() body: Pick<Partial<User>, 'email' | 'password' | 'login'>) {
    return await this.userService.auth(body)
  }

  @Post('/sign_up')
  async signUp (@Body() body: Omit<User, 'id'>) {
    return await this.userService.register(body)
  }

  @Get('/refresh')
  async refresh(@HeaderParam("authorization") token: string, @Res() response: Response) {
    this.userService.refresh(token.split(" ")[1], response)
  }
}
