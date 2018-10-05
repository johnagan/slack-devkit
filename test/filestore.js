const assert = require('chai').assert,
  FileStore = require('../lib/filestore'),
  path = require('path'),
  fs = require('fs');

describe('FileStore', () => {
  const datastore = process.env.datastore || '.data/workspaces';
  const access = { ok: true, team_id: '111111', access_code: '2222222' };

  const filename = path.join(__dirname, datastore);
  const dirname = path.dirname(filename);
  const filestore = new FileStore(filename);

  // clean-up existing filestore
  after(() => {
    fs.unlinkSync(filename);
    fs.rmdirSync(dirname);
  });

  it('should recursively create the file path', () => {
    const created = fs.existsSync(dirname);
    assert.isTrue(created, 'Path not created:\n' + dirname);
  });

  it('should create a file on save', done => {
    filestore.save(access.team_id, { access }).then(result => {
      const created = fs.existsSync(filename);
      assert.isTrue(created, 'File not created:\n' + filename);
      done();
    });
  });

  it('should save access data to a file', done => {
    filestore.get(access.team_id).then(result => {
      const savedData = JSON.stringify(result);
      const orgData = JSON.stringify({ access });
      assert.isTrue(orgData === savedData, "Data doesn't match");
      done();
    });
  });
});
