import cronParser from 'cron-parser';
import {Service, Bot} from 'ringcentral-chatbot/dist/models';
import {BotType, ServiceType} from 'ringcentral-chatbot/dist/types';
import waitFor from 'wait-for-async';

export const handle = async (event: any) => {
  switch (event.type) {
    case 'Message4Bot':
      await handleMessage4Bot(event);
      break;
    case 'GroupJoined': {
      // bot user joined a new group
      const botId = event.message.ownerId;
      const bot = (await Bot.findByPk(botId)) as unknown as BotType;
      const groupId = event.message.body.id;
      await bot.sendMessage(groupId, about());
      await waitFor({interval: 1000});
      await bot.sendMessage(groupId, help());
      break;
    }
    default:
      break;
  }
};

const handleMessage4Bot = async (event: any) => {
  const {text, group, bot} = event;
  const reply = async (messages: any) => {
    if (!Array.isArray(messages)) {
      messages = [messages];
    }
    for (const message of messages) {
      await bot.sendMessage(group.id, message);
    }
  };
  const command = text.split(/\s+/)[0];
  const args = text.split(/\s+(.+)/)[1];
  switch (command.toLowerCase()) {
    case '-a':
    case 'about':
      return reply(about());
    case '-h':
    case 'help':
      return reply(help(args));
    case '-n':
    case 'new':
    case 'add':
    case 'create':
      return reply(await create(args, event));
    case '-l':
    case 'list':
    case 'ls':
      return reply(await list(args, group));
    case '-r':
    case 'remove':
    case 'rm':
    case 'delete':
      return reply(await remove(args, event));
    default:
      return reply([
        {text: "Sorry, I don't understand, please check the manual:"},
        help(undefined),
      ]);
  }
};

const list = async (args: any, group: any) => {
  const services = (await Service.findAll({
    where: {
      name: 'Crontab',
      groupId: group.id,
    },
  })) as unknown as ServiceType[];
  // todo: list all cron jobs for current user
  if (services.length === 0) {
    return {text: 'There is no cron job in this chat group'};
  }
  return {
    text: services
      .map(
        s =>
          `**#${s.id}** [code]${s.data.expression} ${
            s.data.message
          }[/code]Timezone: ${s.data.options.utc ? 'UTC' : s.data.options.tz}`
      )
      .join('\n\n'),
  };
};

const remove = async (args: any, event: any) => {
  let id = args.split(/\s+/)[0];
  if (id.startsWith('#')) {
    id = id.substring(1);
  }
  const service = (await Service.findByPk(id)) as unknown as ServiceType;
  if (service === null) {
    return {text: `Cannot find cron job #${id}`};
  }
  if (service.groupId === event.group.id || service.userId === event.userId) {
    await service.destroy();
    return {text: `Cron job #${id} deleted`};
  } else {
    return {text: `You don't have permission to delete #${id}`};
  }
};

const create = async (args: any, event: any) => {
  const tokens = args.split(/\s+/);
  if (tokens.length < 6) {
    return {
      text: 'Cron job syntax is invalid. Please check [this](https://cdn.filestackcontent.com/gE30XyppQqyNCnNB4a5c).',
    };
  }
  const expression = tokens.slice(0, 5).join(' ');
  try {
    cronParser.parseExpression(expression);
  } catch (e) {
    return {
      text: 'Cron job syntax is invalid. Please check [this](https://cdn.filestackcontent.com/gE30XyppQqyNCnNB4a5c).',
    };
  }
  const {bot, group, userId} = event;
  let groupId = group.id;
  let message = tokens.slice(5).join(' ');
  if (message.startsWith('![:Team](')) {
    // create cron job for another team
    message = tokens.slice(6).join(' ');
    groupId = tokens[5].match(/!\[:Team\]\((\d+)\)/)[1];
  }
  const user = await bot.getUser(userId);
  let options;
  if (
    user.rc &&
    user.rc.regionalSettings &&
    user.rc.regionalSettings.timezone &&
    user.rc.regionalSettings.timezone.name
  ) {
    options = {tz: user.rc.regionalSettings.timezone.name};
  } else {
    options = {utc: true};
  }
  // todo: check cron user in team or not
  const service = (await Service.create({
    name: 'Crontab',
    botId: bot.id,
    groupId,
    userId,
    data: {
      expression,
      message,
      options,
    },
  })) as unknown as ServiceType;
  return {
    text: `Cron job created: \n **#${
      service.id
    }** [code]${expression} ${message}[/code]Timezone: ${
      options.utc ? 'UTC' : options.tz
    }`,
  };
};

const help = (args?: any): any => {
  if (!args) {
    return {
      text: `
* **-a / about**: about this chatbot
* **-h / help [command]**: show help message [about command]
* **-n / new / add / create <cron> [@Team] <message>**: add a cron job
* **-l / list / ls**: list all cron jobs
* **-r /remove / rm / delete <ID>**: delete a cron job by ID

For cron job syntax, please check [this](https://cdn.filestackcontent.com/gE30XyppQqyNCnNB4a5c).
`.trim(),
    };
  }
  const command = args.split(/\s+/)[0];
  switch (command) {
    case '-a':
    case 'about':
      return {text: '**-a / about**: about this chatbot'};
    case '-h':
    case 'help':
      return {
        text: '**-h / help [command]**: show help message [about command]',
      };
    case '-n':
    case 'new':
    case 'add':
    case 'create':
      return {
        text: `**-n / new / add / create <cron> [@Team] <message>**: add a cron job. Example:

      [code]new */2 * * * * hello world[/code]
Example above created a cron job sending "hello world" to current team every 2 minutes.
You can also create a cron job for another team:

      [code]new */2 * * * * @AnotherTeam hello world[/code]
Example above created a cron job sending "hello world" to AnotherTeam every 2 minutes.

For cron job syntax, please check [this](https://cdn.filestackcontent.com/gE30XyppQqyNCnNB4a5c).
`,
      };
    case '-l':
    case 'list':
    case 'ls':
      return {text: '**-l / list / ls**: list all cron jobs'};
    case '-r':
    case 'remove':
    case 'rm':
    case 'delete':
      return {
        text: '**-r / remove / rm / delete <ID>**: delete a cron job by ID',
      };
    default:
      return [
        {text: `Unkown command "${command}", list of known commands:`},
        help(undefined),
      ];
  }
};

const about = () => {
  return {
    text: 'I am a Glip Crontab Chatbot, I am created by ![:Person](850957020). Here is [my source code](https://github.com/tylerlong/glip-crontab-chatbot).',
  };
};
