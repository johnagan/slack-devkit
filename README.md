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


| Name               | Description                                         
| ------------------ | ----------------------------------------------------
| client_id          | Slack client id
| client_secret      | Slack client secret
| signing_secret     | Slack signing secret
| scope              | Comma-delimited scopes for OAuth
| redirect_uri       | Slack OAuth redirect uri
| verification_token | Slack verification token
| access_token       | Access token to use when not distributed
| slack_root         | Root domain to use for Slack requests
| subdomain          | Subdomain to use when hosting with [localtunnel.js](https://github.com/localtunnel/localtunnel)
| datastore          | File path to write to or a DataStore object


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
