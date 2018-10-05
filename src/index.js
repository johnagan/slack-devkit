const CACHE = new WeakMap();

function lazyLoad(object, key, loader) {
  const cache = CACHE.get(object);
  if (cache[key] === undefined) {
    cache[key] = loader();
    CACHE.set(object, cache);
  }
  return cache[key];
}

class SlackDevKit {
  /**
   * Creates an instance of Slack DevKit
   *
   * @param {string} [settings.client_id] Slack client id
   * @param {string} [settings.client_secret] Slack client secret
   * @param {string} [settings.signing_secret] Slack signing secret
   * @param {string} [settings.scope] Comma-delimited scopes for OAuth
   * @param {string} [settings.redirect_uri] Slack OAuth redirect uri
   * @param {string} [settings.verification_token] Slack verification token
   * @param {string} [settings.access_token] Access token to use when not distributed
   * @param {string} [settings.slack_root] Root domain to use for Slack requests
   * @param {string|object} [settings.datastore] File path to write to or a DataStore object
   * @memberof SlackDevKit
   */
  constructor(settings) {
    this.settings = settings;
    CACHE.set(this, {});
  }

  get router() {
    return lazyLoad(this, 'router', () => {
      return require('./server/router');
    });
  }

  get client() {
    return lazyLoad(this, 'client', () => {
      return require('./core/client');
    });
  }

  get app() {
    return lazyLoad(this, 'app', () => {
      const App = require('./core/app');
      return new App(this.settings);
    });
  }

  get server() {
    return lazyLoad(this, 'server', () => {
      const Server = require('./server/express');
      return new Server(this.settings);
    });
  }

  get lambda() {
    return lazyLoad(this, 'lambda', () => {
      const Lambda = require('./server/lambda');
      return new Lambda(this.settings);
    });
  }
}

module.exports = SlackDevKit;
