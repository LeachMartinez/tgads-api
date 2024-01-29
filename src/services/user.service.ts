import { validate } from "class-validator";
import { User } from "../db/models/User";
import { AuthorizationService } from "./authorization.service";
import { getLogger } from "log4js";
import { AppDataSource } from "../db/data-source";
import { AuthToken } from "../db/models/AuthToken";

export class UserService {
  async register(user: Omit<User, "id">) {
    const newUser = new User();
    newUser.email = user.email;
    newUser.login = user.login;
    newUser.name = user.name;
    newUser.password = AuthorizationService.hashPassword(user.password);
    
    const errors = await validate(newUser);

    if (errors.length) {
      getLogger().warn("Новый пользователь не зарегистрировался, валидация не пройдена", errors)
      return errors;
    }

    const userRepository = AppDataSource.getRepository(User);
    const tokenRepository = AppDataSource.getRepository(AuthToken);

    const createdUser = await userRepository.save(newUser);

    const tokens = new AuthorizationService().generateToken({ ...createdUser });
    if (!tokens) return "token not created";
    
    await tokenRepository.save({
      refreshToken: tokens.refreshToken,
      user: {
        id: createdUser.id
      }
    });

    return tokens;
  }
}