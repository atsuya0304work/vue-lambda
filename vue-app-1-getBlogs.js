import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(client);
const tableName = "vue-app-1-blog";

export const handler = async (event) => {
  let body;
  let statusCode;
  
  const headers = {
    "Content-Type": "application/json",
  };
  
  try {
    const data = await dynamo.send(
      new ScanCommand({ TableName: tableName })
    );
    statusCode = 200
    body = data.Items
  } catch (err) {
    statusCode = 400;
    body = err.message;
  } finally {
    body = JSON.stringify(body);
  }
  
  const response = {
    statusCode: statusCode,
    headers: headers,
    body: body
  };
  return response;
};
