const { PORT, SIGNING_SECRET, CLIENT_ID, CLIENT_SECRET, SCOPE } = process.env

const Slack = require('../')

// Configure express with the Slack App settings
const { server, client } = new Slack({
  scope: SCOPE,
  client_id: CLIENT_ID,
  client_secret: CLIENT_SECRET,
  signing_secret: SIGNING_SECRET
})

// All GET routes redirect to the “Add to Slack” OAuth flow
server.get('/', (req, res) => {
  // the req.slack object contains information about the request
  // and the workspace's authentication information
  const { data, app_url } = req.slack

  // Make an authenticated request to the Slack API
  req.slack.api('chat.postMessage', {
    channel: data.installer_user.app_home,
    text: 'Thanks for installing me :bow:'
  })

  // open the Slack client to the App Home
  res.redirect(app_url)
})

// Slash Command and Events API routes automatically load the
// workspace info and related datastore
server.post('/slash-command', (req, res) => {
  // check if a sub-command was sent
  const isUpload = req.slack.isSubCommand('upload')

  // test the message text with regex
  const containsUrl = req.slack.match(/https?:\/\//i)

  // use the included client to call other APIs or
  // to load information from other sites
  if (isUpload && containsUrl) {
    // get the arguments from a sub-command
    const fileUrl = req.slack.subcommand('upload')
    client.get(fileUrl).then(r => {
      const file = Buffer.from(r.data, 'utf8')

      // one-line of code to respond to slash commands with a file
      req.slack.upload({ filename: 'logo.png', file })
    })
  }

  res.send()
})


// All POST routes expect Slack callback events
// and verify against the verification token
server.post('/', (req, res) => {
  // check the event type with is()  
  const isUnfurl = req.slack.is('link_shared')
  const isMessage = req.slack.is('message.app_home')

  // respond with an unfurl easily
  if (isUnfurl) {
    req.slack.unfurl({
      text: "A successful unfurl!",
      image_url: "https://image.com"
    })
  }

  // reply to messages everywhere
  if (isMessage) {
    req.slack.reply({
      text: "Hey! I got your message :sunglasses:"
    })
  }

  res.send()
})

// Start the webserver on port 3000
server.start(PORT)