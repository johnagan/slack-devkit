const assert = require('chai').assert,
  Payload = require('../lib/payload'),
  qs = require('querystring')


describe('Payload', () => {
  describe('parseBody', () => {
    it('should parse url-encoded payloads', () => {
      const data = { testing: '123' }
      const body = qs.stringify(data)
      const result = Payload.parse(body)
      assert.equal(result.testing, data.testing)
    })

    it('should parse json-encoded payloads', () => {
      const data = { testing: '123' }
      const body = JSON.stringify(data)
      const result = Payload.parse(body)
      assert.equal(result.testing, data.testing)
    })

    it('should parse nested payloads', () => {
      const nested = { payload: JSON.stringify({ test: '123' }) }
      const data = { payload: { test: '123' } }
      const body = JSON.stringify(nested)
      const result = Payload.parse(body)

      assert.equal(result.test, data.payload.test)
    })
  })
})