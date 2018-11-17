import app from 'ringcentral-chatbot/dist/apps/index'

import handler from './handler'
import crontab from './crontab'

app.listen(process.env.RINGCENTRAL_CHATBOT_EXPRESS_PORT)

app.bot.on('Message4Bot', event => handler(event))

setInterval(() => crontab(), 60000)
