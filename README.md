# Slack Development Kit
Start building a Slack App quickly with OAuth support, url parsing, and authenticated HTTPS client to call Slack’s API. This was made to build Slack Apps on [Glitch](https://glitch.com) even faster, but it works anywhere.

## Overview

### Features
* OAuth support without 3rd-party database
* Supports Single Channel Installations
* Verifies request signatures and/or verification tokens
* Support for short-lived tokens with automatic refresh
* Automatic retrieval of workspace's authentication info
* Auto-parsing of string-encoded JSON payloads
* Authenticated HTTP client for Slack's API
* Writeable datastore associated to the workspace

### What's Included
* [App](./lib/app.js) - The Slack App
* [Request](./lib/request.js) - The request made from Slack
* [Client](./lib/client.js) - Minimal HTTPS client (to call other APIs)
* [Payload](./lib/payload.js) - Wrapper for Slack payloads (to standardize attributes)
* [FileStore](./lib/filestore.js) - File-based storage to save workspace information to
* [Router](./lib/router.js) - An [Express.js](https://expressjs.com/) router (middleware)
* [Server](./lib/server.js) - An [Express.js](https://expressjs.com/) instance with the router attached


## Getting Started

### Install
```
npm i slack-devkit
```

### Usage
```javascript
const Slack = require('slack-devkit')

// Configure express with the Slack App settings
const { server } = new Slack({
  scope: 'chat:write,bot',
  client_id: "XXXXXXXXXXXXXXXXXXXXX",
  client_secret: "XXXXXXXXXXXXXXXXX",
  signing_secret: "XXXXXXXXXXXXXXXX",
  verification_token: "XXXXXXXXXXXX", // optional
  redirect_uri: 'XXXXXXXXXXXXX',      // optional
  datastore: '.data/workspaces'       // optional
})

// All GET routes redirect to the “Add to Slack” OAuth flow
server.get('/', (req, res) => {
  req.slack.data // the authenticated workspace info
  res.send()
})

// All POST routes expect Slack callback events
// and verify against the verification token
server.post('/', (req, res) => {
  const user = req.slack.user_id
  req.slack.api('users.info', { user }).then(r => {
    r.data // the results of 'users.info' API request
  })
  res.send()
})

// Start the webserver
server.start()
```


### Configuration
The configuration options used for the constructor


| Name                 | Type     | Description                                         
| -------------------- | -------- | ----------------------------------------------------
| `scope`              | Required | [Slack OAuth scopes](https://api.slack.com/docs/oauth#step_1_-_sending_users_to_authorize_and_or_install)
| `client_id`          | Required | [Slack OAuth client id](https://api.slack.com/docs/oauth#step_1_-_sending_users_to_authorize_and_or_install)
| `client_secret`      | Required | [Slack OAuth client secret](https://api.slack.com/docs/oauth#step_1_-_sending_users_to_authorize_and_or_install)
| `redirect_uri`       | Optional | [Slack OAuth redirect uri](https://api.slack.com/docs/oauth#step_1_-_sending_users_to_authorize_and_or_install)
| `signing_secret`     | Optional | [Slack signing secret](https://api.slack.com/docs/verifying-requests-from-slack#about)
| `verification_token` | Optional | [Slack verification token](https://api.slack.com/events-api#url_verification)
| `access_token`       | Optional | Access token for [internal integrations](https://api.slack.com/slack-apps#internal_integrations)
| `slack_root`         | Optional | Root domain to use for Slack requests
| `subdomain`          | Optional | Subdomain to use when hosting with [localtunnel.js](https://github.com/localtunnel/localtunnel)
| `datastore`          | Optional | File path to write to or a DataStore object
