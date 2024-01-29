import { Action } from "routing-controllers";
import { AppDataSource } from "../db/data-source";
import { User } from "../db/models/User";
import { AuthorizationService } from "../services/authorization.service";

export default async (action: Action, roles: string[]) => {
  if (action.request.method === "OPTIONS") {
    action.next!();
  }
  try {
    const authorizationHeader = action.request.headers["authorization"];

    if (!authorizationHeader) return action.response.status(401).json({ message: "Не авторизован" });

    const accessToken = authorizationHeader.split(" ")[1]; //из хежера выцепить сам токен
    if (!accessToken) return action.response.status(401).json({ message: "Не авторизован" });

    const userData = await new AuthorizationService().validateAccessToken(accessToken);

    if (!userData) return action.response.status(401).json({ message: "Не авторизован" });
    const user = AppDataSource.getRepository(User)
    const authUser = await user.findOneBy({ id: userData.id});    
    
    if (!authUser) return false;
      
    return true;
      
  } catch (e) {
    action.response.status(401).json({ message: "Не авторизован" });
    return false;
  }
};
