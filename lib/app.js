const
  FileStore = require('./filestore'),
  client = require('./client'),
  qs = require('querystring'),
  crypto = require('crypto')


/**
 * Slack App
 *
 * @class App
 */
class App {

  /**
   * Creates an instance of App
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
   * @memberof App
   */
  constructor(settings = {}) {
    let { datastore } = settings

    // load the file datastore if none is provided
    if (datastore === undefined || typeof datastore === "string")
      datastore = new FileStore(datastore)

    Object.assign(this, settings, { datastore })
  }


  /**
   * The root url for Slack
   *
   * @readonly
   * @returns {string} slack root url
   * @memberof App
   */
  get root_url() {
    let slack_root = this.slack_root || 'slack.com'
    return `https://${slack_root}`
  }


  /**
   * Generate URL for Add to Slack
   *
   * @param {string} [query.state] The OAuth state to pass through
   * @param {boolean} [query.single_channel] Flag to present single-channel mode
   * @returns {string} Authentication url
   * @memberof App
   */
  getAuthUrl(query = {}) {
    const { state, single_channel } = query
    const { root_url, client_id, scope, redirect_uri } = this
    const params = qs.stringify({ client_id, scope, state, single_channel, redirect_uri })
    return `${root_url}/oauth/authorize?${params}`
  }


  /**
   * Verifies the request timestamp
   * 
   * @param {string} timestamp The request signature timestamp
   * @returns {boolean} Is verified
   * @memberof App
   */
  verifyTimestamp(timestamp) {
    if (timestamp === undefined) return false

    const time = parseInt(timestamp)
    const now = Math.floor(new Date().getTime() / 1000)

    // Check if the timestamp is more than five minutes from local time
    return Math.abs(now - time) <= (60 * 5)
  }


  /**
   * Verifies the request signature
   * 
   * @param {string} signature The request signature
   * @param {string} timestamp The request signature timestamp
   * @param {string} body The request body
   * @returns {boolean} Is verified
   * @memberof App
   */
  verifySignature(signature, timestamp, body) {
    if (this.signing_secret === undefined) return true // not set
    if (signature === undefined) return false // not passed in

    const hmac = crypto.createHmac('sha256', this.signing_secret)
    const [version, hash] = signature.split('=')

    hmac.update(`${version}:${timestamp}:${body}`)
    const validHash = hmac.digest('hex')

    return hash === validHash
  }


  /**
   * Verifies the request token
   * 
   * @param {string} token The request verification token
   * @returns {boolean} Is verified
   * @memberof App
   */
  verifyToken(token) {
    const { verification_token } = this
    return (verification_token === undefined || token === verification_token)
  }


  /**
   * Install the App on a Slack Workspace
   *
   * @param {string} [query.code] The OAuth access code
   * @param {string} [query.team] Slack team ID of a workspace to attempt to restrict to
   * @param {string} [query.state] unique string to be passed back upon completion 
   * @param {boolean} [query.single_channel] Flag to present single-channel mode
   * @returns {Promise} The Slack access info
   * @memberof App
   */
  install(query = {}) {
    const { code } = query

    if (code === undefined)
      return Promise.reject(this.getAuthUrl(query))
    else
      return this.authenticate(code).catch(result => result)
  }


  /**
   * Completes the authentication
   *
   * @param {string} code The OAuth access code returns from Slack
   * @returns {Promise} Slack authentication info
   * @memberof App
   */
  authenticate(code) {
    const { client_id, client_secret, scope, redirect_uri } = this
    const params = { code, scope, client_id, client_secret, redirect_uri }
    return this.api('oauth.access', params)
  }


  /**
   * Refresh the access token
   *
   * @param {object} data the Slack workspace information
   * @returns {Promise} results from the refresh requests
   * @memberof App
   */
  refreshToken(data) {
    const { refresh_token, team_id } = data
    const { client_id, client_secret } = this
    const params = { grant_type: 'refresh_token', refresh_token, client_id, client_secret }

    // updated saved access token
    const update = r => this.datastore.update(team_id, r.data)

    // if refresh token is present, attempt to update the access token
    if (refresh_token === undefined) return Promise.resolve(access)
    return this.api('oauth.access', params).then(update)
  }


  /**
   * Submit an authenticated POST request to Slack
   *
   * @param {string} endPoint the url or endpoint to POST to
   * @param {object} [data] the request data to post
   * @param {object} [headers] additional HTTP headers to include
   * @returns {Promise} the POST response
   * @memberof App
   */
  api(endPoint = '', data = {}, headers = {}) {
    const { root_url, access_token, single_channel_id } = this
    const { attachments, dialog, unfurl, token, channel, file } = data
    const isWebHook = endPoint.startsWith('https://hooks.slack.com')
    const isJSON = (attachments || dialog || unfurl || isWebHook)

    // append base URL when an endpoint is passed in
    if (!/^http/i.test(endPoint))
      endPoint = `${root_url}/api/${endPoint}`

    // override token when passed in from app settings (single workspace)
    if (token === undefined && access_token !== undefined)
      data.token = access_token

    // append the channel_id for single-channel apps (incoming webhooks)
    if (channel === undefined && single_channel_id !== undefined)
      data.channel = single_channel_id

    // append token to header
    if (isJSON && !isWebHook && data.token !== undefined)
      headers['Authorization'] = `Bearer ${data.token}`

    const callback = r => {
      const successful = r.data.ok === undefined || r.data.ok === true
      return successful ? Promise.resolve(r) : Promise.reject(r)
    }

    if (file !== undefined) {
      return client.upload(endPoint, data, data.filename, headers).then(callback)
    } else
      return client.post(endPoint, data, headers, isJSON).then(callback)
  }
}

module.exports = App