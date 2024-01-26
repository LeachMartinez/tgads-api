import 'reflect-metadata';

import { Body, Controller, Post } from "routing-controllers";
import { User } from '../db/models/User';
import { UserService } from '../services/user.service';

@Controller()
export class AuthController {
  @Post("/sign_in")
  signIn() {
    
  }

  @Post("/sign_up")
  signUp(@Body() body: User) {
    const userService = new UserService();
    userService.register(body);
  }
}