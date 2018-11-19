import { Service, Bot } from 'ringcentral-chatbot/dist/models'
import cronParser from 'cron-parser'
import moment from 'moment-timezone'

const crontab = async () => {
  const services = await Service.findAll({ where: { name: 'Crontab' } })
  for (const service of services) {
    const currentTimestamp = moment.tz(new Date(), service.data.options.utc ? 'utc' : service.data.options.tz).seconds(0).milliseconds(0)
    const interval = cronParser.parseExpression(service.data.expression, service.data.options)
    const prevTimestamp = interval.prev()._date
    if (currentTimestamp - prevTimestamp === 0) {
      const bot = await Bot.findByPk(service.botId)
      try {
        await bot.sendMessage(service.groupId, { text: service.data.message })
      } catch (e) { // catch the exception so that it won't break the for loop
        console.error(e)
      }
    }
  }
}

export default crontab
