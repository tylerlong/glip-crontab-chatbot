# Glip Crontab Chatbot


## Dev setup

```
yarn install
cp .sample.env .env
edit .env
yarn ngork
yarn dev
HTTP PUT -u admin:password https://<bot-server>/admin/setup-database
```


## Deploy to AWS Lambda

```
cp .sample.env.yml .env.yml
edit .env.yml
yarn deploy
HTTP PUT -u admin:password https://<bot-server>/admin/setup-database
```

### Check remote logs

```
sls logs -f app/proxy/crontab/maintain
```

## Todo

- Allow cron job to execute code from external scripts
    - could be dangerous

## Known issue

```
node_modules/@types/istanbul-reports/index.d.ts:8:16 - error TS2305: Module '"istanbul-lib-report"' has no exported member 'ReportBase'.
```

### Solution

```
yarn add --dev @types/istanbul-lib-report
```

Delete `./node_modules/@types/istanbul-reports/node_modules/@types/istanbul-lib-report`, because it is an old version.
