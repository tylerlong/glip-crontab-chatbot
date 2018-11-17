import Service from 'ringcentral-chatbot/dist/models/Service'
import Bot from 'ringcentral-chatbot/dist/models/Bot'
import cronParser from 'cron-parser'
import moment from 'moment-timezone'

const crontab = async () => {
  const services = await Service.findAll({ where: { name: 'Crontab' } })
  const currentTimestamp = moment.tz(new Date(), 'utc').seconds(0).milliseconds(0)
  for (const service of services) {
    const interval = cronParser.parseExpression(service.data.expression, { utc: true })
    const prevTimestamp = interval.prev()._date
    if (currentTimestamp - prevTimestamp === 0) {
      const bot = await Bot.findByPk(service.botId)
      await bot.sendMessage(service.groupId, { text: service.data.message })
    }
  }
}

export default crontab
