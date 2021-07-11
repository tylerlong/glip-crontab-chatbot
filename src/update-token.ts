// eslint-disable-next-line node/no-unpublished-import
import RingCentral from '@rc-ex/core';
import {spawnSync} from 'child_process';

const tokens: string[] = [];

const rc = new RingCentral({
  clientId: '',
  clientSecret: '',
  server: 'https://platform.ringcentral.com',
});

(async () => {
  for (const token of tokens) {
    rc.token = {access_token: token};
    const id = (await rc.restapi().account().extension().get()).id;

    spawnSync('curl', [
      '-X',
      'PUT',
      '-u',
      'username:password',
      `https://xxxxxx.execute-api.us-east-1.amazonaws.com/prod/admin/update-token?id=${id}&token=${token}`,
    ]);
  }
})();
