const
  AWS = require("aws-sdk"),
  dynamo = new AWS.DynamoDB.DocumentClient()

class DynamoDB {

  /**
   * Creates an instance of DynamoDB.
   * @param {string} [table_name=workspaces] The table name to save to
   * @memberof DynamoDB
   */
  constructor(table_name = 'workspaces') {
    this.table_name = table_name
  }

  /**
   * Dynamo Save
   *
   * @param {string} id The id of the record
   * @param {Object} data The record data
   * @return {Promise} A Promise with the save results
   * @memberof DynamoDB
   */
  save(id, data) {
    data.id = id
    return this.query('put', { Item: data })
  }


  /**
   * Dynamo Get
   *
   * @param {String} id - The record's key
   * @return {Promise} A Promise with the get result
   * @memberof DynamoDB
   */
  get(id) {
    const params = { Key: { id } }
    return this.query('get', params).then(d => d.Item)
  }


  /**
   * Dynamo Query
   *
   * @param {String} name - The query action to run
   * @param {Object} params - The query parameters
   * @return {Promise} A Promise with the get result
   * @memberof DynamoDB
   */
  query(method, params) {
    params.TableName = this.table_name

    return new Promise((resolve, reject) => {
      dynamo[method](params, (err, data) => {
        err ? reject(err) : resolve(params.Item)
      })
    })
  }
}

module.exports = DynamoDB