import 'reflect-metadata';
import { Authorized, Controller, Get } from 'routing-controllers';

@Controller()
export class UserController {

  @Authorized()
  @Get("/user")
  user() {
    return "ok"
  }
}