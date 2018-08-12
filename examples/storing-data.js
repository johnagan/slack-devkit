const { PORT, SIGNING_SECRET, CLIENT_ID, CLIENT_SECRET, SCOPE } = process.env

const Slack = require('../')

const { server } = new Slack({
  scope: SCOPE,
  client_id: CLIENT_ID,
  client_secret: CLIENT_SECRET,
  signing_secret: SIGNING_SECRET
})


// Add to Slack Route
server.get('/', (req, res) => {
  const { app_id } = req.slack.access

  // store some data
  const timestamp = new Date().getTime()
  req.slack.set('installed_on', timestamp)

  // redirect to Slack
  res.redirect('https://slack.com/app_redirect?app=' + app_id)
})


// Slash Command Route
server.post('/slash-command', (req, res) => {

  // read saved data
  const installed_on = req.slack.get('installed_on')

  // respond with installation info
  if (user === undefined) text = 'You never installed'
  else text = 'Installed on ' + installed_on

  res.json({ text })
})


// Start webserver
server.start(PORT)
