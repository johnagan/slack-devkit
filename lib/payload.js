const qs = require('querystring')

/**
 * Slack Payload
 *
 * @class Payload
 */
class Payload {

  /**
   * The payload constructor
   *
   * @param {string} body - the request body
   * @memberof Payload
   */
  constructor(body) {
    if (typeof body === "string") {
      body = this.constructor.parse(body)
    }

    Object.assign(this, body)
  }

  static parse(body) {
    try {
      body = JSON.parse(body)
    } catch (e) {
      body = qs.parse(body)
    }

    // interactive messages
    if (body.payload) body = JSON.parse(body.payload)

    return body
  }


  /**
   * Get an interactive message's selected action
   *
   * @return {object} the action
   * @memberof Payload
   */
  get action() {
    if (this.actions) return this.actions[0]
  }


  /**
   * Get a message's selected option
   *
   * @return {object} the selected option
   * @memberof Payload
   */
  get selection() {
    if (this.action && this.action.selected_options)
      return this.action.selected_options[0]
  }


  /**
   * Get the sub-command arguments for a command
   *
   * @param {string} name - the sub-command name
   * @return {string} the sub-command arguments
   * @memberof Payload
   */
  subcommand(name) {
    if (this.isSubCommand(name))
      return this.text.substring(name.length)
  }


  /**
   * Match the message text against a regex
   *
   * @param {RegExp} regex - the regex to test
   * @return {Array} the regex match
   * @memberof Payload
   */
  match(regex) {
    if (typeof regex !== "object") regex = new RegExp(regex, "im")
    if (this.text) return this.text.match(regex)
  }


  /**
   * Check if the payload is a type of event
   *
   * @param {String} type - the event type to check
   * @return {Boolean} does the payload match the type 
   * @memberof Payload
   */
  is(type) {
    return this.types.includes(type) || this.match(type)
  }


  /**
   * Check if the a slash command contains a sub-command
   *
   * @param {String} name - the sub-command name
   * @return {Boolean} is the command a sub-command
   * @memberof Payload
   */
  isSubCommand(name) {
    const regex = new RegEx("^" + name, "i")
    return this.match(regex)
  }


  /**
   * Get the message text
   *
   * @return {String} the message text
   * @memberof Payload
   */
  get text() {
    // Slash Commands
    if (super.text) return super.text

    // Events API
    if (this.event && this.event.text) return this.event.text
  }


  /**
   * Set the text
   *
   * @param {String} text - the text
   * @memberof Payload
   */
  set text(text) {
    super.text = text
  }


  /**
   * Get the bot id the payload was sent from (if applicable)
   *
   * @return {String} the bot id
   * @memberof Payload
   */
  get bot_id() {
    return super.bot_id || (this.event && this.event.bot_id)
  }


  /**
   * Set the bot id
   *
   * @param {String} bot_id - the bot id
   * @memberof Payload
   */
  set bot_id(bot_id) {
    super.bot_id = bot_id
  }


  /**
   * Get the channel id the payload was sent from
   *
   * @return {String} the channel id
   * @memberof Payload
   */
  get channel_id() {
    // Interactive Messages
    if (this.channel) return this.channel.id

    // Slash Commands
    if (super.channel_id) return super.channel_id

    // Events API
    let event = this.event
    if (event && event.channel) return event.channel
    if (event && event.item) return event.item.channel
  }


  /**
   * Set the channel id
   *
   * @param {String} channel_id - the channel id
   * @memberof Payload
   */
  set channel_id(channel_id) {
    super.channel_id = channel_id
  }


  /**
   * Get the team id the payload was sent from
   *
   * @return {String} the team id
   * @memberof Payload
   */
  get team_id() {
    // Interactive Messages
    if (this.team) return this.team.id

    // Slash Commands
    if (super.team_id) return super.team_id

    // Events API
    let event = this.event
    if (event && event.team) return event.team
    if (event && event.item) return event.item.team
  }


  /**
   * Set the team id
   *
   * @param {String} team_id - the team id
   * @memberof Payload
   */
  set team_id(team_id) {
    super.team_id = team_id
  }


  /**
   * Get the user id that sent the payload
   *
   * @return {String} the user id
   * @memberof Payload
   */
  get user_id() {
    // Interactive Messages
    if (this.user) return this.user.id

    // Slash Commands
    if (super.user_id) return super.user_id

    // Events API
    let event = this.event
    if (event && event.user) return event.user
    if (event && event.item) return event.item.user
  }


  /**
   * Set the user id
   *
   * @param {String} user_id - the user id
   * @memberof Payload
   */
  set user_id(user_id) {
    super.user_id = user_id
  }


  /**
   * Get event types that triggered this payload
   *
   * @return {Array} the event types
   * @memberof Payload
   */
  get event_types() {
    let events = []

    // incoming message by type
    if (this.type) events.push(this.type)

    // message came from a bot
    if (this.bot_id) events.push('bot_message')

    // event triggered by event type
    if (this.event) events.push('event', this.event.type)

    // url challenge request
    if (this.challenge) events.push('challenge', this.challenge)

    // slash command by command
    if (this.command) events.push('slash_command', this.command)

    // webhook triggered by trigger word
    if (this.trigger_word) events.push('webhook', this.trigger_word)

    // interactive message triggered by callback_id
    if (this.callback_id) events.push('interactive_message', this.callback_id)

    // message selection
    if (this.selection) events.push('message_select', this.selection.value)

    // message button triggered by callback_id
    if (this.action) events.push('message_button', this.action.value)

    // ensure unique values
    events = events.filter((v, i, a) => a.indexOf(v) === i);

    return events
  }
}

module.exports = Payload