const { SIGNING_SECRET, CLIENT_ID, CLIENT_SECRET, SCOPE, TABLE_NAME } = process.env

const Slack = require('../')

// Configure express with the Slack App settings
const { lambda } = new Slack({
  scope: SCOPE,
  client_id: CLIENT_ID,
  client_secret: CLIENT_SECRET,
  signing_secret: SIGNING_SECRET,
  datastore: TABLE_NAME
})

exports.handler = lambda((slack, context, callback) => {
  // route events based on the payload
  if (slack.is('app_installed'))
    return sendInstallMessage(slack, context)
})

function sendInstallMessage(slack, context) {
  // the slack object contains information about the request
  // and the workspace's authentication information
  const { data, app_url } = slack

  // open the Slack client to the App Home
  const redirect = () => context.fail(app_url)

  // construct a welcome message to the installer
  const message = {
    channel: data.installer_user.app_home,
    text: 'Thanks for installing me :bow:'
  }

  // Make an authenticated request to the Slack API
  return slack.api('chat.postMessage', message).then(redirect)
}