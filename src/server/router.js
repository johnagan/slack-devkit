const
  FileStore = require('../datastore/filestore'),
  Request = require('../core/request'),
  App = require('../core/app')

module.exports = function(settings) {
  const { datastore } = settings

  // load the file datastore if none is provided
  if (datastore === undefined || typeof datastore === "string")
    settings.datastore = new FileStore(datastore)

  // Digest the request body as needed
  const parseBody = (req, res, next) => {
    if (req.body) return next() // the body has already been digested

    const body = []
    req.on('data', data => body.push(data))
    req.on('end', () => {
      req.body = body.join('')
      return next()
    })
  }

  const middleware = (req, res, next) => {
    const done = () => next()
    const app = new App(settings)
    req.slack = new Request(app, req)
    const { valid, challenge, code, install_url } = req.slack

    // redirect to OAuth
    if (install_url) return res.redirect(install_url)

    // OAuth callback from Slack
    if (code) return req.slack.install().then(done)

    // Failed request verification
    if (!valid) return res.sendStatus(401)

    // Events API challenge request
    if (challenge) return res.send(challenge)

    // Load workspace data and continue
    return req.slack.load().then(done)
  }

  return [parseBody, middleware]
}