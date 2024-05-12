import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand
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
    // blog取得
    const blog = await dynamo.send(
      new GetCommand({
        TableName: tableName,
        Key: {
          id: event.body.id
        },
      })
    );
    await dynamo.send(
      // 更新処理
      new PutCommand({
        TableName: tableName,
        Item: {
          id: event.body.id,
          open: event.body.open,
          title: event.body.title,
          body: event.body.body,
          userId: blog.Item.userId,
          username: blog.Item.username,
          like: blog.Item.like
        },
      })
    );
    statusCode = 200;
    // resBody = `Update item ${event.body.id}`;
    resBody = blog.Item
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
