import awsSdk from 'aws-sdk';

/**
 * DynamoDB datastore
 */
export = class DynamoDB {
  private dynamo: awsSdk.DynamoDB.DocumentClient;
  tableName: string;

  /**
   * Creates an instance of DynamoDB.
   * @param tableName The table name to save to
   */
  constructor(tableName: string = 'workspaces') {
    this.dynamo = new awsSdk.DynamoDB.DocumentClient();
    this.tableName = tableName;
  }

  /**
   * Dynamo Save
   *
   * @param id The id of the record
   * @param data The record data
   * @return A Promise with the save results
   */
  save(id: string, data: any) {
    data.id = id;
    return this.query('put', { Item: data });
  }

  /**
   * Dynamo Get
   *
   * @param id The record's key
   * @return A Promise with the get result
   */
  get(id: string) {
    const params = { Key: { id } };
    return this.query('get', params).then((d: any) => d.Item);
  }

  /**
   * Dynamo Query
   *
   * @param name The query action to run
   * @param params The query parameters
   * @return A Promise with the get result
   */
  query(method: string, params: any) {
    params.TableName = this.tableName;

    return new Promise((resolve: Function, reject: Function) => {
      this.dynamo[method](params, (err: any) => {
        err ? reject(err) : resolve(params.Item);
      });
    });
  }
};
