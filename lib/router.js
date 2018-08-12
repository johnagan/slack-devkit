const express = require('express'),
  Request = require('./request')


module.exports = function(app) {
  const router = express.Router()


  // Routing for Slack OAuth
  router.get('*', (req, res, next) => {
    req.slack = new Request(app, req)
    const redirect = url => res.redirect(url)
    req.slack.install().then(() => next()).catch(redirect)
  })


  // Digest the request body as needed
  router.post('*', (req, res, next) => {
    if (req.body) return next() // the body has already been digested

    const body = []
    req.on('data', data => body.push(data))
    req.on('end', () => {
      req.body = body.join('')
      return next()
    })
  })


  // Append the Slack Request
  router.post('*', (req, res, next) => {
    req.slack = new Request(app, req)

    const { valid, challenge } = req.slack

    // Failed request verification
    if (!valid) return res.sendStatus(401)

    // Events API challenge request
    if (challenge) return res.send(challenge)

    // Load workspace data and continue
    req.slack.load().then(() => next())
  })

  return router
}