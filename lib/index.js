const
  App = require('./app'),
  client = require('./client'),
  Router = require('./router'),
  Server = require('./server')

module.exports = function(options) {
  const app = new App(options)
  const router = new Router(app)
  const server = new Server(router, options)
  return { router, server, app, client }
}