import bodyParser from 'body-parser'
import express, { type RequestHandler } from 'express'
import { useExpressServer } from 'routing-controllers'
import httpContext from 'express-http-context'
import cors from 'cors'
import 'dotenv/config'
import log4js from 'log4js'
import { AppDataSource } from './db/data-source'
import { AuthController } from './controllers/auth.controller'
import authMiddleware from './middlewares/auth.middleware'
import { UserController } from './controllers/user.controller'
import { TelegramController } from './controllers/telegram.controller'

const logger = log4js.getLogger()
logger.level = process.env.LOG_LEVEL ?? 'debug'

AppDataSource.initialize()
  .then(() => {
    logger.info('Data Source has been initialized!')
  })
  .catch((err) => {
    logger.info('Error during Data Source initialization:', err)
  })

const app: express.Express = express()

app.use(bodyParser.json())
app.use(cors() as RequestHandler)
app.use(httpContext.middleware)

useExpressServer(app, {
  authorizationChecker: authMiddleware,
  controllers: [AuthController, UserController, TelegramController]
})

app.use((req, res, next) => {
  httpContext.ns.bindEmitter(req)
  httpContext.ns.bindEmitter(res)
})

app.listen(process.env.PORT, () => { logger.info(`Running on port ${process.env.PORT}`) })
