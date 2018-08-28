const Payload = require('./payload')

/**
 * A Slack Request
 * 
 * @extends Payload
 */
class Request extends Payload {

  /**
   * The payload constructor
   *
   * @param {object} app The Slack App
   * @param {object} request The Slack request
   * @param {object} [data] The workspace data
   * @memberof Request
   */
  constructor(app = {}, request = {}, data = {}) {
    super(request.body, request.query)
    Object.assign(this, { app, request, data })
  }


  /**
   * Get a header value
   *
   * @param {string} name Header name
   * @returns {string} Header value
   * @memberof Request
   */
  getHeader(name) {
    const { headers } = this.request
    return headers[name] || headers[name.toLowerCase()]
  }


  /**
   * Url to open the App in Slack
   *
   * @readonly
   * @returns {string} the url to the App DM
   * @memberof Request
   */
  get app_url() {
    const { app, data } = this
    return `${app.root_url}/app_redirect?app=${data.app_id}`
  }


  /**
   * The Add to Slack url, based on the request
   *
   * @readonly
   * @returns {string} the Add to Slack url
   * @memberof Request
   */
  get install_url() {
    const { query, method } = this.request
    if (method === 'GET' && query.code === undefined)
      return this.app.getAuthUrl(query)
  }


  /**
   * Determine if the Request is valid
   *
   * @readonly
   * @returns {boolean} is valid
   * @memberof Request
   */
  get valid() {
    return this.valid_timestamp && this.valid_signature && this.valid_token
  }


  /**
   * Determine if the Timestamp is valid
   *
   * @readonly
   * @returns {boolean} is valid
   * @memberof Request
   */
  get valid_timestamp() {
    const timestamp = this.getHeader('X-Slack-Request-Timestamp')
    return this.app.verifyTimestamp(timestamp)
  }


  /**
   * Determine if the Request Signature is valid
   *
   * @readonly
   * @returns {boolean} is valid
   * @memberof Request
   */
  get valid_signature() {
    const signature = this.getHeader('X-Slack-Signature')
    const timestamp = this.getHeader('X-Slack-Request-Timestamp')
    return this.app.verifySignature(signature, timestamp, this.request.body)
  }


  /**
   * Determine if the Verification Token is valid
   *
   * @readonly
   * @returns {boolean} is valid
   * @memberof Request
   */
  get valid_token() {
    return this.app.verifyToken(this.token)
  }


  /**
   * Events API retry reason
   *
   * @readonly
   * @returns {string} the retry reason
   * @memberof Request
   */
  get retry_reason() {
    return this.getHeader('X-Slack-Retry-Reason')
  }


  /**
   * Events API retry attempt number
   *
   * @readonly
   * @returns {number} the retry attempt number
   * @memberof Request
   */
  get retry_number() {
    return parseInt(this.getHeader('X-Slack-Retry-Num') || 0)
  }


  /**
   * Submit an authenticated POST request to Slack
   *
   * @param {string} endPoint the url or endpoint to POST to
   * @param {object} [data] the request data to post
   * @param {object} [headers] additional HTTP headers to include 
   * @returns {Promise} the POST response
   * @memberof Request
   */
  api(endPoint = '', data = {}, headers = {}) {
    const { access_token, single_channel_id } = this.data

    // append the channel_id for single-channel apps (incoming webhooks)
    if (data.channel === undefined && single_channel_id)
      data.channel = single_channel_id

    // append access token from data
    if (data.token === undefined && access_token)
      data.token = access_token

    // recallable post request
    const submit = this.app.api.bind(this.app, endPoint, data, headers)

    // submit and refresh token as needed
    return submit().then(res => {
      // attempt to refresh token as needed
      if (res.data.error != 'invalid_auth') return res
      else return this.app.refreshToken(this.data).then(submit)
    })
  }


  /**
   * Reply to an event or interactive message
   *
   * @param {object} args the request POST arguments
   * @returns {Promise} the POST response
   * @memberof Request
   */
  reply(args) {
    let endpoint = 'chat.postMessage'
    const { response_url, channel_id } = this
    if (response_url) endpoint = response_url
    if (args.channel == undefined) args.channel = channel_id
    return this.api(endpoint, args)
  }


  /**
   * Reply to an event or interactive message with a file
   *
   * @param {object} args the request POST arguments
   * @returns {Promise} the POST response
   * @memberof Request
   */
  upload(args) {
    let endpoint = 'files.upload'
    const { channel_id } = this

    // append single-channel mode channel_id when available
    if (args.channels === undefined && channel_id !== undefined)
      args.channels = channel_id

    return this.api(endpoint, args)
  }


  /**
   * Unfurl a link
   *
   * @param {object} attachment the attachment to display
   * @param {object} [url] the url to unfurl
   * @returns {Promise} the unfurl response
   * @memberof Request
   */
  unfurl(attachment, url) {
    const { channel, message_ts, links } = this.event
    const unfurls = {}

    // build unfurls attachments
    if (url === undefined) url = links[0].url
    unfurls[url] = attachment

    return this.api('chat.unfurl', { ts: message_ts, channel, unfurls })
  }


  /**
   * Install the App based on the request
   *
   * @returns {Promise} 
   * @memberof Request
   */
  install() {
    const { code } = this
    const update = r => this.update(r.data)
    return this.app.authenticate(code).then(update).catch(update)
  }


  /**
   * Get a stored data value
   *
   * @param {string} key the data key
   * @returns {object} the saved value
   * @memberof Request
   */
  get(key) {
    return this.data[key]
  }


  /**
   * Set a data key to store
   *
   * @param {string} key the data key
   * @param {object} value the data value
   * @returns {Promise} the saved data
   * @memberof Request
   */
  set(key, value) {
    this.data[key] = value
    return this.update(this.data)
  }


  /**
   * Updates a record in the datastore
   *
   * @returns {Promise} the saved record
   * @memberof Request
   */
  update(data) {
    this.data = data
    const { ok, team_id } = data
    if (ok === true) this.app.datastore.save(team_id, data)
  }


  /**
   * Loads the related data from the datastore
   *
   * @returns {Promise} the record
   * @memberof Request
   */
  load() {
    const update = data => this.data = data
    return this.app.datastore.get(this.team_id).then(update)
  }

}

module.exports = Request