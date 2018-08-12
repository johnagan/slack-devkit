const { PORT, SIGNING_SECRET, CLIENT_ID, CLIENT_SECRET, SCOPE } = process.env

const express = require('express'),
  Slack = require('../'),
  app = express()


const { router } = new Slack({
  scope: SCOPE,
  client_id: CLIENT_ID,
  client_secret: CLIENT_SECRET,
  signing_secret: SIGNING_SECRET
})


// Add to Slack Route
app.get('/', router, (req, res) => {
  const { data, app_url } = req.slack
  const { ok, installer_user } = data

  // an error happened during oauth
  if (!ok) return res.json(data)

  // Send a welcome message to the installer
  req.slack.api('chat.postMessage', {
    channel: installer_user.app_home,
    text: 'Thanks for installing me :bow:'
  })

  // redirect to Slack
  res.redirect(app_url)
})


// Slash Command Route
app.post('/slash-command', router, (req, res) => {

  // respond to a slash command with a wave
  req.slack.reply({
    text: 'Hello :wave:'
  })

  res.send()
})


// Events API route
app.post('/events-api', router, (req, res) => {
  const { installer_user } = req.slack.data

  // Send a hello message
  req.slack.api('chat.postMessage', {
    channel: installer_user.app_home,
    text: 'Hello :wave:'
  })

  res.send()
})


// Start webserver
const listener = app.listen(PORT, () => {
  console.log('Server started on port ' + listener.address().port)
})