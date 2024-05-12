import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand
} from "@aws-sdk/lib-dynamodb";
import bcrypt from "bcryptjs";

const client = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(client);
const tableName = "vue-app-1-user";


export const handler = async (event) => {
  const requestUserId = event.body.userId
  const requestUserPassword = event.body.password
  const requestUsername = event.body.username
  const requestEmail = event.body.email

  let resBody;
  let statusCode;
  const headers = {
    "Content-Type": "application/json",
  };

  try {
    const body = await dynamo.send(
      // userId重複確認
      new GetCommand({
        TableName: tableName,
        Key: {
          userId: requestUserId
        },
      })
    );
    if (body.Item) {
      statusCode = 403;
      body = {
        "errCode": "E0011",
        "errMessage": "IDが使われてます"
      };
      return
    }
    
    // 登録処理
    let hashPassword = bcrypt.hashSync(requestUserPassword, 8);

    await dynamo.send(
      new PutCommand({
        TableName: tableName,
        Item: {
          userId : requestUserId,
          email: requestEmail,
          password: hashPassword,
          username: requestUsername,
        },
      })
    );
    
    statusCode = 200;
    resBody = {
      "resultCode": "1",
      "message": "ユーザーを登録しました"
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
