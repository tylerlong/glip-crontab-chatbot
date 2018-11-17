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
    case 'help':
      return reply(help(args))
    case 'new':
    case 'add':
    case 'create':
      return reply(await create(args, event))
    case 'list':
    case 'ls':
      return reply(await list(args, group))
    case 'remove':
    case 'rm':
    case 'delete':
      return reply(await remove(args, group))
    default:
      await reply([
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
    return { text: 'No cron job found for this chat group' }
  }
  return { text: services.map(s => `ID: **${s.id}** [code]${s.data.expression} ${s.data.message}[/code]`).join('\n') }
}

const remove = async (args, group) => {
  const id = args.split(/\s+/)[0]
  const service = await Service.findByPk(id)
  if (service === null) {
    return { text: `cannot find cron job with ID ${id}` }
  }
  if (service.groupId === group.id) {
    await service.destroy()
    return { text: 'cron job deleted' }
  } else {
    return { text: 'You don\'t have perission to delete this cron job' }
  }
}

const create = async (args, event) => {
  const tokens = args.split(/\s+/)
  if (tokens.length < 6) {
    return { text: 'Cron job syntax is invalid. Please check https://cdn.filestackcontent.com/gE30XyppQqyNCnNB4a5c' }
  }
  const expression = tokens.slice(0, 5).join(' ')
  try {
    cronParser.parseExpression(expression, { utc: true })
  } catch (e) {
    return { text: 'Cron job syntax is invalid. Please check https://cdn.filestackcontent.com/gE30XyppQqyNCnNB4a5c' }
  }
  const { bot, group, userId } = event
  const message = tokens.slice(5).join(' ')
  await Service.create({
    name: 'Crontab',
    botId: bot.id,
    groupId: group.id,
    userId,
    data: { expression, message }
  })
  return { text: `cron job added: [code]${expression} ${message}[/code]` }
}

const help = args => {
  if (!args) {
    return { text: `
- **help [command]**: show help message [about command]
- **new / add / create <cron> <message>**: add a cron job
- **list / ls**: list all cron jobs
- **remove / rm / delete <ID>**: delete a cron job by ID
`.trim()
    }
  }
  const command = args.split(/\s+/)[0]
  switch (command) {
    case 'help':
      return { text: `**help [command]**: show help message [about command]` }
    case 'new':
    case 'add':
    case 'create':
      return { text: `**new / add / create <cron> <message>**: add a cron job. Example:

      [code]new */2 * * * * hello world[/code]
Example above created a cron job sending "hello world" to Glip every 2 minutes.

For cron job syntax, please check https://cdn.filestackcontent.com/gE30XyppQqyNCnNB4a5c
` }
    case 'list':
    case 'ls':
      return { text: '**list / ls**: list all cron jobs' }
    case 'remove':
    case 'rm':
    case 'delete':
      return { text: '**remove / rm / delete <ID>**: delete a cron job by ID' }
    default:
      return [{ text: `unkown command "${command}", list of known commands:` }, help(undefined)]
  }
}
