import { validate } from "class-validator";
import { User } from "../db/models/User";
import { AuthorizationService } from "./authorization.service";
import { getLogger } from "log4js";
import { AppDataSource } from "../db/data-source";
import { AuthToken } from "../db/models/AuthToken";

export class UserService {
  async register(user: Omit<User, "id">) {
    const userRepository = AppDataSource.getRepository(User);
    const findedUser = await userRepository.find({
      where: [
        { login: user.login },
        { email: user.email }
      ]
    });

    if (findedUser.length) return "Пользователь уже зарегистрирован!"

    const newUser = new User();
    newUser.email = user.email;
    newUser.login = user.login;
    newUser.name = user.name;
    newUser.password = AuthorizationService.hashPassword(user.password)
    
    const errors = await validate(newUser);

    if (errors.length) {
      getLogger().warn("Новый пользователь не зарегистрировался, валидация не пройдена", errors.flatMap(err => ({ error: err.constraints, target: err.property, value: err.value })))
      return errors.flatMap(err => ({ error: err.constraints, target: err.property }));
    }

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