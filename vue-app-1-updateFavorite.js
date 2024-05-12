import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  DeleteCommand,
  GetCommand,
  PutCommand
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
    // DELETE
    if (event.body.isLiked) {
      // お気に入りテーブルから削除
      await dynamo.send(
        new DeleteCommand({
          TableName: "vue-app-1-userFavorite",
          Key: {
            userId : event.body.userId,
            blogId : event.body.blogId,
          },
        })
      )
    }
    // INSERT
    if (!event.body.isLiked) {
      // お気に入りテーブル追加
      await dynamo.send(
        // 登録処理
        new PutCommand({
          TableName: "vue-app-1-userFavorite",
          Item: {
            userId : event.body.userId,
            blogId : event.body.blogId,
          },
        })
      );
    }
    
    // blog取得
    const blog = await dynamo.send(
      new GetCommand({
        TableName: "vue-app-1-blog",
        Key: {
          id: event.body.blogId
        },
      })
    );
    
    // 更新処理
    const newFavorite = event.body.isLiked ? --blog.Item.like : ++blog.Item.like
    await dynamo.send(
      new PutCommand({
        TableName: "vue-app-1-blog",
        Item: {
          id: event.body.blogId,
          open: blog.Item.open,
          title: blog.Item.title,
          body: blog.Item.body,
          userId: blog.Item.userId,
          username: blog.Item.username,
          like: newFavorite
        },
      })
    );
    statusCode = 200;
    resBody = `UPDDATE item ${event.body.blogId}`;
  }
  catch (err) {
    statusCode = 400;
    resBody = err.message;
  }
  finally {
    resBody = JSON.stringify(resBody);
  }
  
  const response = {
    statusCode: statusCode,
    headers: headers,
    body: resBody
  };
  return response;
};
