const
  qs = require('querystring'),
  https = require('https'),
  url = require('url')

/**
 * Submit a GET request
 *
 * @param {string} uri the url to send the GET to
 * @param {object} [data] the querystring parameters
 * @param {object} [headers] the HTTP headers to include
 * @returns {Promise} the GET response
 */
exports.get = function(uri = '', data = {}, headers = {}) {
  const query = uri + '?' + qs.stringify(data)
  return this.request(query, '', headers, 'GET')
}


/**
 * Submit a POST request
 *
 * @param {string} uri the url to send the POST to
 * @param {object} data the request data to post
 * @param {object} [headers] the HTTP headers to include
 * @param {object} [isJSON=false] post content as JSON
 * @returns {Promise} the POST response
 */
exports.post = function(uri = '', data = {}, headers = {}, isJSON = false) {
  const encoder = isJSON ? JSON : qs
  const body = encoder.stringify(data)
  const contentType = isJSON ? 'json; charset=utf-8' : 'x-www-form-urlencoded'
  headers['Content-Type'] = `application/${contentType}`
  return this.request(uri, body, headers)
}


/**
 * Upload a file to Slack
 *
 * @param {string} uri the url to send the POST to
 * @param {object} data the request data to post
 * @param {object} filename the name and exension of the file
 * @param {object} [headers] the HTTP headers to include
 * @returns {Promise} the POST response
 */
exports.upload = function(uri = '', data = {}, filename = '', headers = {}) {
  const boundary = 'xxxxxxxxxx'
  const delimeter = Buffer.from(`--${boundary}\r\n`, "utf8")

  const payload = Object.keys(data).reduce((body, key) => {
    const append = text => body.push(Buffer.from(text + '\r\n', "utf8"))
    let value = data[key]

    if (Buffer.isBuffer(value)) {
      append(`Content-Disposition: form-data; name="${key}"; filename="${filename}";`)
      append(`Content-Type: application/octet-stream\r\n`)
      body.push(value)
      append("")
    } else {
      append(`Content-Disposition: form-data; name="${key}";\r\n\r\n${value}`)
    }

    return body.concat([delimeter])
  }, [delimeter])

  headers['Content-Type'] = `multipart/form-data; boundary=${boundary}`
  return this.request(uri, Buffer.concat(payload), headers)
}


/**
 * Submit an HTTP request
 *
 * @param {string} uri the url to send the POST to
 * @param {string} [body] the request body
 * @param {object} [headers] the HTTP headers to include
 * @param {string} [method] the HTTP method to use (default: POST)
 * @returns {Promise} the HTTP response
 */
exports.request = function(uri = '', body = '', headers = {}, method = 'POST') {
  headers['Content-Length'] = Buffer.byteLength(body)
  headers['User-Agent'] = 'slack-devkit'

  const { protocol, hostname, path } = url.parse(uri)
  const options = { protocol, hostname, path, headers, method }

  return new Promise((resolve, reject) => {
    const request = https.request(options, response => {
      let data = []
      const { headers } = response
      response.on('data', chunk => data.push(chunk))
      response.on('end', () => {

        // join data based on content type
        if (data.length > 0 && Buffer.isBuffer(data[0]))
          data = Buffer.concat(data)
        else
          data = data.join('')

        // parse if response is JSON
        if (/json/.test(headers['content-type']))
          data = JSON.parse(data)

        return resolve({ data, options, headers, request, body })
      })
    })

    request.on('error', err => reject(err))
    request.write(body)
    request.end()
  })
}