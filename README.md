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
