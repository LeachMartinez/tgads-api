import { validate } from "class-validator";
import { User } from "../db/models/User";
import { AuthorizationService } from "./authorization.service";
import { getLogger } from "log4js";

export class UserService {
  async register(user: User) {
    const newUser = new User();
    newUser.email = user.email;
    newUser.login = user.login;
    newUser.name = user.name;
    newUser.password = AuthorizationService.hashPassword(user.password);
    
    const errors = await validate(newUser);

    if (errors) {
      getLogger().warn("Новый пользователь не зарегистрировался, валидация не пройдена", errors)
      return errors;
    }

    
  }
}