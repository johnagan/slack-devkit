const { PORT, SIGNING_SECRET, CLIENT_ID, CLIENT_SECRET, SCOPE } = process.env

const Slack = require('../')

const { server, client } = new Slack({
  scope: SCOPE,
  client_id: CLIENT_ID,
  client_secret: CLIENT_SECRET,
  signing_secret: SIGNING_SECRET
})


// Slack OAuth Route
server.get('/', (req, res) => {
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


// Slash Command route to upload a file
server.post('/slash-command', (req, res) => {
  const fileUrl = 'https://d3vv6lp55qjaqc.cloudfront.net/items/0g1j143z0u341v0N4536/slack_image.png'

  client.get(fileUrl).then(r => {
    const file = Buffer.from(r.data, 'utf8')
    req.slack.upload({ filename: 'slack_image.png', file })
  })

  res.send()
})


// Events API route to unfurl
server.post('/unfurl', (req, res) => {
  req.slack.unfurl({
    text: "text",
    title: "title",
    title_link: "https://link.com",
    image_url: "https://image.com"
  })

  res.send()
})


// Start webserver
server.start(PORT)