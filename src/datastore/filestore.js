const
  fs = require('fs'),
  path = require('path')


/**
 * File-based database to store workspace info
 * 
 * @class FileStore
 */
class FileStore {

  /**
   * Creates an instance of FileStore
   * @param {string} [filePath=.data/workspaces] path to the filestore
   * @memberof FileStore
   */
  constructor(filePath = ".data/workspaces") {
    this.filePath = this.createPath(filePath)
  }


  /**
   * The working filestore
   *
   * @readonly
   * @returns {FileStore} The filestore
   * @memberof FileStore
   */
  get data() {
    if (this.__cache === undefined) {
      const options = { flag: 'a+', encoding: 'utf8' }
      const file = fs.readFileSync(this.filePath, options)
      this.__cache = JSON.parse(file || '{}')
    }

    return this.__cache
  }


  /**
   * Get a record by id
   * 
   * @param {string} id The id of the record
   * @returns {Promise} The record
   * @memberof FileStore
   */
  get(id) {
    return Promise.resolve(this.data[id] || {})
  }


  /**
   * Save a record
   *
   * @param {string} id The id of the record
   * @param {Object} data The record data
   * @returns {Promise} The saved record
   * @memberof FileStore
   */
  save(id, data) {
    return new Promise((resolve, reject) => {
      this.data[id] = data
      const file = JSON.stringify(this.data)
      fs.writeFile(this.filePath, file, { flag: 'w+' }, err => {
        if (err) return reject(err)
        return resolve(data)
      })
    })
  }


  /**
   * Recursively creates the folder path as needed
   *
   * @param {string} filePath The relative or absolute path to create
   * @returns {string} The absolute path (created as needed)
   * @memberof FileStore
   */
  createPath(filePath) {
    const appRoot = path.dirname(require.main.filename || process.mainModule.filename)
    const absolutePath = path.resolve(appRoot, filePath)
    const pathParts = absolutePath.split(path.sep)
    const filename = pathParts.pop() // remove filename

    // recursively create path
    pathParts.reduce((root, name) => {
      const pathName = path.join(root, name)

      // attemp to create the folder
      try { fs.statSync(pathName) } catch (e) {
        if (e.code != 'ENOENT') throw e
        else fs.mkdirSync(pathName)
      }

      return pathName
    }, path.sep)

    return absolutePath
  }
}

module.exports = FileStore