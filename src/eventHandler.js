import cronParser from 'cron-parser'
import Service from 'ringcentral-chatbot/dist/models/Service'

export const handle = async event => {
  if (event.type !== 'Message4Bot') {
    return // we don't care about other events
  }
  const { text, group, bot } = event
  const reply = async messages => {
    if (!Array.isArray(messages)) {
      messages = [messages]
    }
    for (const message of messages) {
      await bot.sendMessage(group.id, message)
    }
  }
  const command = text.split(/\s+/)[0]
  const args = text.split(/\s+(.+)/)[1]
  switch (command.toLowerCase()) {
    case '-h':
    case 'help':
      return reply(help(args))
    case '-n':
    case 'new':
    case 'add':
    case 'create':
      return reply(await create(args, event))
    case '-l':
    case 'list':
    case 'ls':
      return reply(await list(args, group))
    case '-r':
    case 'remove':
    case 'rm':
    case 'delete':
      return reply(await remove(args, group))
    default:
      return reply([
        { text: 'Sorry, I don\'t understand, please check the manual:' },
        help(undefined)
      ])
  }
}

const list = async (args, group) => {
  let services = await Service.findAll({
    where: {
      name: 'Crontab',
      groupId: group.id
    }
  })
  if (services.length === 0) {
    return { text: 'There is no cron job in this chat group' }
  }
  return { text: services.map(s => `**#${s.id}** [code]${s.data.expression} ${s.data.message}[/code]`).join('\n') }
}

const remove = async (args, group) => {
  let id = args.split(/\s+/)[0]
  if (id.startsWith('#')) {
    id = id.substring(1)
  }
  const service = await Service.findByPk(id)
  if (service === null) {
    return { text: `Cannot find cron job #${id}` }
  }
  if (service.groupId === group.id) {
    await service.destroy()
    return { text: `Cron job #${id} deleted` }
  } else {
    return { text: `You don't have perission to delete #${id}` }
  }
}

const create = async (args, event) => {
  const tokens = args.split(/\s+/)
  if (tokens.length < 6) {
    return { text: 'Cron job syntax is invalid. Please check https://cdn.filestackcontent.com/gE30XyppQqyNCnNB4a5c' }
  }
  const expression = tokens.slice(0, 5).join(' ')
  try {
    cronParser.parseExpression(expression)
  } catch (e) {
    return { text: 'Cron job syntax is invalid. Please check https://cdn.filestackcontent.com/gE30XyppQqyNCnNB4a5c' }
  }
  const { bot, group, userId } = event
  const message = tokens.slice(5).join(' ')
  const user = await bot.getUser(userId)
  let options
  if (user.rc && user.rc.regionalSettings && user.rc.regionalSettings.timezone && user.rc.regionalSettings.timezone.name) {
    options = { tz: user.rc.regionalSettings.timezone.name }
  } else {
    options = { utc: true }
  }
  const service = await Service.create({
    name: 'Crontab',
    botId: bot.id,
    groupId: group.id,
    userId,
    data: {
      expression,
      message,
      options
    }
  })
  return { text: `Cron job created: \n **#${service.id}** [code]${expression} ${message}[/code]` }
}

const help = args => {
  if (!args) {
    return { text: `
* **-h / help [command]**: show help message [about command]
* **-n / new / add / create <cron> <message>**: add a cron job
* **-l / list / ls**: list all cron jobs
* **-r /remove / rm / delete <ID>**: delete a cron job by ID

For cron job syntax, please check https://cdn.filestackcontent.com/gE30XyppQqyNCnNB4a5c
`.trim()
    }
  }
  const command = args.split(/\s+/)[0]
  switch (command) {
    case '-h':
    case 'help':
      return { text: `**-h / help [command]**: show help message [about command]` }
    case '-n':
    case 'new':
    case 'add':
    case 'create':
      return { text: `**-n / new / add / create <cron> <message>**: add a cron job. Example:

      [code]new */2 * * * * hello world[/code]
Example above created a cron job sending "hello world" to Glip every 2 minutes.

For cron job syntax, please check https://cdn.filestackcontent.com/gE30XyppQqyNCnNB4a5c
` }
    case '-l':
    case 'list':
    case 'ls':
      return { text: '**-l / list / ls**: list all cron jobs' }
    case '-r':
    case 'remove':
    case 'rm':
    case 'delete':
      return { text: '**-r / remove / rm / delete <ID>**: delete a cron job by ID' }
    default:
      return [{ text: `Unkown command "${command}", list of known commands:` }, help(undefined)]
  }
}
