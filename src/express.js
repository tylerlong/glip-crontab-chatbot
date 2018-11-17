import createApp from 'ringcentral-chatbot/dist/apps'

import { handle } from './eventHandler'
import crontab from './crontab'

const app = createApp(handle)
app.listen(process.env.RINGCENTRAL_CHATBOT_EXPRESS_PORT)

setInterval(() => crontab(), 60000)
