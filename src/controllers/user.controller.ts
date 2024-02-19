import 'reflect-metadata'
import { Authorized, Controller, Get } from 'routing-controllers'

@Controller()
export class UserController {
  @Get('/user')
  @Authorized()
  user () {
    return 'ok'
  }
}
