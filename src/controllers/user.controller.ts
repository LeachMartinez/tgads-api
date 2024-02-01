import { Request } from 'express'
import 'reflect-metadata'
import { Authorized, Controller, Get, Req } from 'routing-controllers'

@Controller()
export class UserController {
  @Get('/user')
  @Authorized()
  user () {
    return 'ok'
  }
}
