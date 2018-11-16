import express from 'express'

import botApp from 'ringcentral-chatbot/dist/apps/bot'
import adminApp from 'ringcentral-chatbot/dist/apps/admin'

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/admin', adminApp)
app.use('/bot', botApp)

console.log('before')
app.listen(process.env.RINGCENTRAL_CHATBOT_EXPRESS_PORT)
console.log('after')
