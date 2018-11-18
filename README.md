# Glip Crontab Chatbot


## Dev setup

```
yarn install
cp .sample.env .env
edit .env
yarn ngork
yarn dev
HTTP PUT https://<bot-server>/admin/setup-database
```


## Deploy to AWS Lambda

```
cp .sample.env.yml .env.yml
edit .env.yml
yarn build
yarn deploy
HTTP PUT https://<bot-server>/admin/setup-database
```

### Check remote logs

```
sls logs -f app/proxy/crontab
```


## "Reboot"

"Reboot" is useful in the following cases:

- If for reason bot server changed, you need to re-setup WebHooks
- You bot server was down for quite a while and your WebHooks have been blacklisted
- If there is orphan data in database

You can "reboot" to resolve the issues above:

```
HTTP PUT https://<bot-server>/admin/reboot
```


## Todo

- We can get each user's timezone settings via `rc.get('/restapi/v1.0/account/~/extension/~')`
