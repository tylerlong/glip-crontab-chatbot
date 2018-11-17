import app from 'ringcentral-chatbot/dist/apps/index'

import { handle } from './eventHandler'
import crontab from './crontab'

app.listen(process.env.RINGCENTRAL_CHATBOT_EXPRESS_PORT)

app.$.subscribe(event => handle(event))

setInterval(() => crontab(), 60000)
