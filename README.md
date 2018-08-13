![](https://cl.ly/3V2e321C0D00/logo-black.png)

# Slack Development Kit
Slack DevKit is a light-weight developer kit to build [Slack Apps](https://api.slack.com/slack-apps) in node.js **super fast**. No previous knowledge about building Slack Apps or Bots needed! Plus, automatic support for verifying requests from Slack and responding to validations.

This was made to build Slack Apps on [Glitch](https://glitch.com) even faster, but it works everywhere!

Learn more on [SlackDevKit.com](https://slackdevkit.com)

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


### Examples
| File | Description                                         
| ------------------------------------- | ----------------------------------------------------
| [features.js](./examples/features.js) | Examples of some common Slack App features
| [internal-integration.js](./examples/internal-integration.js) | Example configuration of an [internal integrations](https://api.slack.com/slack-apps#internal_integrations)
| [storing-data.js](./examples/storing-data.js) | Example of storing and retrieving data from the datastore
| [express.js](./examples/express.js) | Example of adding Slack DevKit to an exiting [Express.js](https://expressjs.com/) server

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
  client_id: "1212313.1231231231231",
  client_secret: "12312312323123123",
  signing_secret: "sdfsadfsadfasdfas",
  redirect_uri: "https://myserver.com", // optional
  datastore: ".data/workspaces"         // optional
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

// Start the webserver on port 3000
server.start(3000)
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
| `datastore`          | Optional | File path to write to or a DataStore object
