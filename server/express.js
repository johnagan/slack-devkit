const
  express = require('express'),
  Router = require('./router')


// Nothing fancy here - just making it easy to start express with the router
module.exports = function(options) {
  const router = new Router(options)

  const app = express()
  app.use(options.route || '/', router)


  // support for localhost if the package is available
  const tunnel = function(subdomain, port) {
    return new Promise((resolve, reject) => {
      const localtunnel = require('localtunnel')
      localtunnel(port, { subdomain }, (err, tunnel) => {
        console.log(`Server started on port ${port} and url ${tunnel.url}`)
        return err ? reject(err) : resolve(tunnel)
      })
    })
  }


  // Start webserver and localtunnel
  app.startLocal = function(subdomain, port) {
    return this.start(port).then(server => tunnel(subdomain, server.port))
  }


  // helper to start the webserver
  app.start = function(port) {
    return new Promise((resolve, reject) => {
      const listener = app.listen(port, err => {
        port = listener.address().port
        console.log(`Server started on port ${port}`)
        return err ? reject(err) : resolve({ app, listener, port })
      })
    })
  }

  return app
}