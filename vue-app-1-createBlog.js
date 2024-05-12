import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(client);
const tableName = "vue-app-1-blog";


export const handler = async (event) => {
  let resBody;
  let statusCode;
  const headers = {
    "Content-Type": "application/json",
  };
  
  try {
    await dynamo.send(
      // 登録処理
      new PutCommand({
        TableName: tableName,
        Item: {
          id: event.body.id,
          open: event.body.open,
          title: event.body.title,
          userId: event.body.userId,
          username: event.body.username,
          body: event.body.body,
          like: 0
        },
      })
    );
    statusCode = 200;
    resBody = {
      "resultCode": "1",
      "message": "ブログを登録しました"
    };
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