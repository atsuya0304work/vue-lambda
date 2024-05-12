import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
  let resBody;
  let statusCode;
  const headers = {
    "Content-Type": "application/json",
  };
  
  try {
    // 該当ブログを削除
    await dynamo.send(
      new DeleteCommand({
        TableName: "vue-app-1-blog",
        Key: {
          id: event.body.id,
        },
      })
    );
    statusCode = 200;
    resBody = `Deleted item ${event.body.id}`;
  } catch (err) {
    statusCode = 400;
    resBody = err.message;
  } finally {
    resBody = JSON.stringify(resBody);
  }
  
  const response = {
    statusCode: statusCode,
    headers: headers,
    body: resBody
  };
  
  return response;
};
