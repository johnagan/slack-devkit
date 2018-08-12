# Slack Development Kit
Start building a Slack App quickly with OAuth support, url parsing, and authenticated HTTPS client to call Slack’s API. This was made to build Slack Apps on [Glitch](https://glitch.com) even faster, but it works anywhere.

## Install
```
npm i slack-devkit
```

## Usage
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

## Features
☑ OAuth support without 3rd-party database

☑ Supports Single Channel Installations

☑ Verifies request signatures and/or verification tokens

☑ Support for short-lived tokens with automatic refresh

☑ Automatic retrieval of workspace's authentication info

☑ Auto-parsing of string-encoded JSON payloads

☑ Authenticated HTTP client for Slack's API

☑ Writeable datastore associated to the workspace


## Configuration
The configuration options used for the constructor


| Name                 | Description                                         
| -------------------- | ----------------------------------------------------
| `client_id`          | [Slack OAuth client id](https://api.slack.com/docs/oauth#step_1_-_sending_users_to_authorize_and_or_install)
| `client_secret`      | [Slack OAuth client secret](https://api.slack.com/docs/oauth#step_1_-_sending_users_to_authorize_and_or_install)
| `scope`              | [Slack OAuth scopes](https://api.slack.com/docs/oauth#step_1_-_sending_users_to_authorize_and_or_install)
| `redirect_uri`       | [Slack OAuth redirect uri](https://api.slack.com/docs/oauth#step_1_-_sending_users_to_authorize_and_or_install)
| `signing_secret`     | [Slack signing secret](https://api.slack.com/docs/verifying-requests-from-slack#about)
| `verification_token` | [Slack verification token](https://api.slack.com/events-api#url_verification)
| `access_token`       | Access token for [internal integrations](https://api.slack.com/slack-apps#internal_integrations)
| `slack_root`         | Root domain to use for Slack requests
| `subdomain`          | Subdomain to use when hosting with [localtunnel.js](https://github.com/localtunnel/localtunnel)
| `datastore`          | File path to write to or a DataStore object


## Slack Request
The Slack record object is appended to all requests where the router is used. It is a Object that can be written to and saved for future requests.

#### data
The datastore associated to the workspace

#### app_url
The redirect url to open the App DM in Slack

#### api(`endpoint` or `uri`, `args`)
An authenticated HTTP client that will post to Slack’s API

#### reply(`message`)
Sends a message back to the channel the event was recieved on

#### set(`key`, `value`)
Sets a value in the workspace datastore

#### get(`key`)
Returns a value from the workspace datastore


## DataStore Interface
The default datastore is file-based and stored at `.data/workspaces`. If you would like to change this, there are two options:

- Passing in a new file path to `datastore` will attempt to use that file path
- Passing in a new Object to `datastore` will attempt to call two functions `get` and `save`

#### DataStore.get(`team_id`)
This method should return a Promise containing a single workspace info associated to a `team_id`

#### DataStore.save(`team_id`, `{}`)
The method should return a Promise containing the saved workspace info associated to a `team_id`

#### DataStore.update(`team_id`, `{}`)
The method should return a Promise containing the updated workspace info associated to a `team_id`
