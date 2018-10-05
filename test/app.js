const assert = require('chai').assert,
  crypto = require('crypto'),
  qs = require('querystring'),
  App = require('../lib/app'),
  FileStore = require('../lib/filestore');

const {
  slack_root,
  client_id,
  client_secret,
  scope,
  redirect_uri
} = process.env;

describe('App', () => {
  describe('config', () => {
    it('should default to empty', () => {
      const app = new App();
      assert.isNotNull(app.config);
    });

    it('should pass data from constructor', () => {
      const test = '123';
      const app = new App({ test });
      assert.equal(app.test, test);
    });
  });

  describe('root_url', () => {
    it('should return a default root_url', () => {
      const app = new App();
      assert.equal(app.root_url, `https://slack.com`);
    });

    it('should return the a default root_url', () => {
      const slack_root = 'testing.com';
      const app = new App({ slack_root });
      assert.equal(app.root_url, `https://${slack_root}`);
    });
  });

  describe('getAuthUrl', () => {
    const app = new App({ client_id, redirect_uri, scope });
    const url = app.getAuthUrl({ redirect_uri, state: 'test' });

    it('should work with no params', () => {
      const url = app.getAuthUrl();
      assert.isNotNull(url);
    });

    it('should contain the correct endpoint', () => {
      assert.include(url, `/oauth/authorize?`);
    });

    it('should contain client_id from settings', () => {
      const url = app.getAuthUrl();
      const query = qs.stringify({ client_id });
      assert.include(url, query);
    });

    it('should contain scope from settings', () => {
      const url = app.getAuthUrl();
      const query = qs.stringify({ scope });
      assert.include(url, query);
    });

    it('should contain redirect_uri from settings', () => {
      const url = app.getAuthUrl();
      const query = qs.stringify({ redirect_uri });
      assert.include(url, query);
    });

    it('should contain state from params', () => {
      const state = 'testing';
      const url = app.getAuthUrl({ state });
      const query = qs.stringify({ state });
      assert.include(url, query);
    });

    it('should contain single_channel from params', () => {
      const single_channel = 'testing';
      const url = app.getAuthUrl({ single_channel });
      const query = qs.stringify({ single_channel });
      assert.include(url, query);
    });
  });

  describe('install', () => {
    const app = new App({ client_id, client_secret });

    it('should return the install with no params', done => {
      const url = app.getAuthUrl();
      const validate = result => assert.equal(result, url);
      app
        .install()
        .catch(validate)
        .then(done);
    });

    it('should pass through state param', done => {
      const query = { state: 123 };
      const params = qs.stringify(query);
      const validate = result => assert.include(result, params);
      app
        .install(query)
        .catch(validate)
        .then(done);
    });

    it('should pass through single_channel param', done => {
      const query = { single_channel: true };
      const params = qs.stringify(query);
      const validate = result => assert.include(result, params);
      app
        .install(query)
        .catch(validate)
        .then(done);
    });

    it('should attempt to authenticate with code', done => {
      const query = { code: 123 };
      app.install(query).then(r => {
        assert.isFalse(r.data.ok);
        assert.equal(r.data.error, 'invalid_code');
        done();
      });
    });
  });

  describe('refresh', done => {
    const { access_token, refresh_token } = process.env;
    const access = { refresh_token, access_token, team_id: '1' };
    const app = new App({ client_id, client_secret, slack_root });

    // no refresh token provided
    if (refresh_token === undefined) return;

    it('should get a refresh token', done => {
      app.refresh(access).then(({ access }) => {
        assert.isTrue(access.ok);
        assert.isNotNull(access.access_token);
        done();
      });
    });

    it('should automatically refresh access token', done => {
      app.api('auth.test', {}, { access }).then(r => {
        assert.isTrue(r.data.ok);
        done();
      });
    });
  });

  describe('verifyTimestamp', () => {
    const app = new App();

    it('should fail on timestamps greater than 5 minutes', () => {
      const secondsnow = Math.floor(new Date().getTime() / 1000);
      const sevenminslater = secondsnow + 60 * 7;
      const valid = app.verifyTimestamp(sevenminslater);
      assert.isFalse(valid);
    });

    it('should fail on timestamps less than 5 minutes', () => {
      const secondsnow = Math.floor(new Date().getTime() / 1000);
      const sevenminslater = secondsnow - 60 * 7;
      const valid = app.verifyTimestamp(sevenminslater);
      assert.isFalse(valid);
    });

    it('should fail when not passed in', () => {
      const valid = app.verifyTimestamp();
      assert.isFalse(valid);
    });

    it('should validate on timestamps within than 5 minutes', () => {
      const secondsnow = Math.floor(new Date().getTime() / 1000);
      const valid = app.verifyTimestamp(secondsnow);
      assert.isTrue(valid);
    });
  });

  describe('verifySignature', () => {
    const version = 'v0';
    const signing_secret = '123';
    const body = JSON.stringify({ test: 123 });
    const timestamp = Math.floor(new Date().getTime() / 1000);
    const hmac = crypto.createHmac('sha256', signing_secret);

    hmac.update(`${version}:${timestamp}:${body}`);
    const signature = version + '=' + hmac.digest('hex');

    it('should fail when no token is passed in', () => {
      const app = new App({ signing_secret });
      const valid = app.verifySignature();
      assert.isFalse(valid);
    });

    it('should fail on invalid signatures', () => {
      const app = new App({ signing_secret });
      const valid = app.verifySignature('testing', timestamp, body);
      assert.isFalse(valid);
    });

    it('should verify when no token is set', () => {
      const app = new App();
      const valid = app.verifySignature(signing_secret);
      assert.isTrue(valid);
    });

    it('should verify valid signatures', () => {
      const app = new App({ signing_secret });
      const valid = app.verifySignature(signature, timestamp, body);
      assert.isTrue(valid);
    });
  });

  describe('verifyToken', () => {
    it('should fail when no token is passed in', () => {
      const verification_token = '123';
      const app = new App({ verification_token });
      const valid = app.verifyToken();
      assert.isFalse(valid);
    });

    it('should fail on invalid token', () => {
      const invalid_token = 'abc';
      const verification_token = '123';
      const app = new App({ verification_token });
      const valid = app.verifyToken(invalid_token);
      assert.isFalse(valid);
    });

    it('should verify on correct token', () => {
      const verification_token = '123';
      const app = new App({ verification_token });
      const valid = app.verifyToken(verification_token);
      assert.isTrue(valid);
    });

    it('should verify when no token is set', () => {
      const verification_token = '123';
      const app = new App();
      const valid = app.verifyToken(verification_token);
      assert.isTrue(valid);
    });
  });

  describe('datastore', () => {
    it('should default to filestore', () => {
      const app = new App();
      assert.isNotNull(app.datastore);
      assert.equal(typeof app.datastore, typeof new FileStore());
    });

    it('should allow datastore path', () => {
      const datastore = 'test/123';
      const app = new App({ datastore });
      assert.isNotNull(app.datastore);
      assert.include(app.datastore.filePath, datastore);
    });

    it('should support datastores passed in', () => {
      const datastore = new function() {}();
      const app = new App({ datastore });
      assert.isNotNull(app.datastore);
      assert.equal(app.datastore, datastore);
    });
  });
});
