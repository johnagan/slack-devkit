const
  DynamoDB = require('../datastore/dynamodb'),
  Request = require('../core/request'),
  App = require('../core/app')

module.exports = function(settings) {
  const { datastore } = settings

  // load the dynamodb datastore if none is provided
  if (datastore === undefined || typeof datastore === "string")
    settings.datastore = new DynamoDB(datastore)

  const handler = (cb, event, context, callback) => {
    const app = new App(settings)
    const slack = new Request(app, event)
    const { valid, challenge, code, install_url } = slack
    const done = () => cb(slack, context, callback)

    // redirect to OAuth
    if (install_url) return context.fail(install_url)

    // OAuth callback from Slack
    if (code) return slack.install().then(done)

    // Failed request verification
    if (!valid) return context.fail("Invalid Request")

    // Events API challenge request
    if (challenge) return context.succeed(challenge)

    // Load workspace data and continue
    return slack.load().then(done)
  }

  return cb => handler.bind(null, cb)

}
