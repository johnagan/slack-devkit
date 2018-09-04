import fs from 'fs';
import path from 'path';

/**
 * File-based datastore
 */
export = class FileStore {
  private cache: any;
  /** The file path the datastore will be written to */
  filePath: string;

  /**
   * Creates an instance of FileStore
   * @param {string} [filePath=.data/workspaces] The file path the datastore will be written to
   */
  constructor(filePath: string = '.data/workspaces') {
    this.filePath = this.createPath(filePath);
  }

  /**
   * The working filestore
   *
   * @returns The filestore
   */
  get data() {
    if (this.cache === undefined) {
      const options = { flag: 'a+', encoding: 'utf8' };
      const file = fs.readFileSync(this.filePath, options);
      this.cache = JSON.parse(file || '{}');
    }

    return this.cache;
  }

  /**
   * Get a record by id
   *
   * @param id The id of the record
   * @returns The record
   */
  get(id: string) {
    return Promise.resolve(this.data[id] || {});
  }

  /**
   * Save a record
   *
   * @param id The id of the record
   * @param data The record data
   * @returns The saved record
   */
  save(id: string, data: any) {
    return new Promise((resolve: Function, reject: Function) => {
      this.data[id] = data;
      const file = JSON.stringify(this.data);
      fs.writeFile(this.filePath, file, { flag: 'w+' }, (err: any) => {
        if (err) return reject(err);
        return resolve(data);
      });
    });
  }

  /**
   * Recursively creates the folder path as needed
   *
   * @param filePath The relative or absolute path to create
   * @returns The absolute path (created as needed)
   */
  createPath(filePath: string) {
    const appRoot = path.dirname(
      require.main.filename || process.mainModule.filename
    );
    const absolutePath = path.resolve(appRoot, filePath);
    const pathParts = absolutePath.split(path.sep);
    const filename = pathParts.pop(); // remove filename

    // recursively create path
    const reduce = (root: string, name: string) => {
      const pathName = path.join(root, name);

      // attemp to create the folder
      try {
        fs.statSync(pathName);
      } catch (e) {
        if (e.code !== 'ENOENT') throw e;
        else fs.mkdirSync(pathName);
      }

      return pathName;
    };

    // recursively create path
    pathParts.reduce(reduce, path.sep);

    return absolutePath;
  }
};
