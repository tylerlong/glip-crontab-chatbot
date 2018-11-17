import createApp from 'ringcentral-chatbot/dist/apps'
import { createAsyncProxy } from 'ringcentral-chatbot/dist/lambda'
import serverlessHTTP from 'serverless-http'

import { handle } from './eventHandler'
import crontab from './crontab'

const app = createApp(handle)
module.exports.app = serverlessHTTP(app)

module.exports.proxy = createAsyncProxy('app')

module.exports.crontab = crontab
