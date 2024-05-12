import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  QueryCommand
} from "@aws-sdk/lib-dynamodb";
import bcrypt from "bcryptjs";


const client = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(client);
const tableName = "vue-app-1-user";


export const handler = async (event) => {
  const requestUserId = event.body.userId
  const requestUserPassword = event.body.password
  
  let body;
  let statusCode;
  
  const headers = {
    "Content-Type": "application/json",
  };

  try {
    // ユーザーIDを条件にusertableから取得
    body = await dynamo.send(
      new GetCommand({
        TableName: tableName,
        Key: {
          userId: requestUserId
        },
      })
    );
    
    // IDチェック
    if (!body.Item) {
      statusCode = 403;
      body = {
        "errCode": "E0001",
        "errMessage": "IDが違います"
      };
    } else {
      // PASSチェック
      const compared = await bcrypt.compare(requestUserPassword, body.Item.password)
      // body = compared
      if (!compared) {
        statusCode = 403;
        body = {
          "errCode": "E0002",
          "errMessage": "Passが違います"
        };
      } else {
        // お気に入りを取得
        const favoriteBody = await dynamo.send(
          new QueryCommand({
            TableName: "vue-app-1-userFavorite",
            ExpressionAttributeNames: {
              "#PK": "userId",
            },
            ExpressionAttributeValues: {
              ":PK": requestUserId
            },
            KeyConditionExpression: "#PK = :PK"
          })
        );
        const blogObj = body.Item
        const favorite = favoriteBody.Items.map(function(obj){
          return obj.blogId
        })
        statusCode = 200
        body = {
          "userId": blogObj.userId,
          "email": blogObj.email,
          "username": blogObj.username,
          "favorite": favorite
        };
      }
    }

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
