import { DataSource } from "typeorm";
import { User } from "./models/User";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "",
  database: "tgads_development",
  synchronize: true,
  logging: true,
  entities: [User],
  subscribers: [],
  migrations: [],

})