import createApp from 'ringcentral-chatbot/dist/apps';
import {createAsyncProxy} from 'ringcentral-chatbot/dist/lambda';
import serverlessHTTP from 'serverless-http';
import axios from 'axios';

import {handle} from './eventHandler';
import crontab from './crontab';

const app = createApp(handle);
module.exports.app = serverlessHTTP(app);

module.exports.proxy = createAsyncProxy('app');

module.exports.maintain = async () =>
  axios.put(
    `${process.env.RINGCENTRAL_CHATBOT_SERVER}/admin/maintain`,
    {},
    {
      auth: {
        username: process.env.RINGCENTRAL_CHATBOT_ADMIN_USERNAME!,
        password: process.env.RINGCENTRAL_CHATBOT_ADMIN_PASSWORD!,
      },
    }
  );

module.exports.crontab = crontab;
