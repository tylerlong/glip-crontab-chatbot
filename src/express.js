import app from 'ringcentral-chatbot/dist/apps/index'

app.listen(process.env.RINGCENTRAL_CHATBOT_EXPRESS_PORT)

app.bot.on('Message4Bot', message => {
  console.log(message)
})
