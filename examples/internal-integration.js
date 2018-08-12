const { PORT, SIGNING_SECRET, TOKEN } = process.env

const Slack = require('../')

const { server } = new Slack({
  scope: SCOPE,
  access_token: TOKEN,
  signing_secret: SIGNING_SECRET
})


// Slash Command Route
server.post('/slash-command', (req, res) => {

  // respond to a slash command with a wave
  req.slack.reply({
    text: 'Hello :wave:'
  })

  res.send()
})


// Events API route
server.post('/events-api', (req, res) => {
  const { installer_user } = req.slack.data

  // Send a hello message
  req.slack.api('chat.postMessage', {
    channel: installer_user.app_home,
    text: 'Hello :wave:'
  })

  res.send()
})


// Start webserver
server.start()
