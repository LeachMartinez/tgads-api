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
  async signUp(@Body() body: Omit<User, "id">) {;
    const userService = new UserService();
    return await userService.register(body);
  }
}