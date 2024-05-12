import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  GetCommand,
  DeleteCommand,
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
    resBody = []
    let blogCountData = []
    let count = {}
    
    // // お気に入りレコード削除処理
    // // お気に入りされているレコードを取得
    const favoriteRes = await dynamo.send(
      new ScanCommand({ TableName: "vue-app-1-userFavorite" })
    );
    const favoriteBody = favoriteRes.Items
    
    for (const obj of favoriteBody){
      // BLOGテーブルに存在するかチェック
      let body = await dynamo.send(
        new GetCommand({
          TableName: "vue-app-1-blog",
          Key: {
            id: obj.blogId
          },
        })
      );
      if (!body.Item) {
        // 該当ブログを削除
        await dynamo.send(
          new DeleteCommand({
            TableName: "vue-app-1-userFavorite",
            Key: {
              userId: obj.userId,
              blogId : obj.blogId
            },
          })
        );
        resBody.push(`DELETE ${obj.blogId} FROM vue-app-1-userFavorite`)
      } else {
        // お気に入りテーブルのデータを配列に格納
        blogCountData.push(obj.blogId)
      }
    }
    // resBody.push(blogCountData)
    
    // お気に入りの配列の項目ごとに件数を計上
    blogCountData.forEach(item => {
      if (count[item]) {
        count[item]++
      } else {
        count[item] = 1
      }
    })
    // for (const item in count) {
    //   resBody.push(`${item}: ${count[item]} 件`)
    // }
      
    // ブログのカウント修正
    const blogRes = await dynamo.send(
      new ScanCommand({ TableName: "vue-app-1-blog" })
    );
    const blogBody = blogRes.Items
    
    let blogId
    let likeCount
    for (const obj of blogBody){
      blogId = obj.id
      likeCount = obj.like
      if (count[blogId]) {
        // 1件以上
        if (count[blogId] === likeCount) {
          resBody.push(`NO FIX ID ${blogId}: LIKE COUNT ${likeCount}`)
        } else {
          // FIX 処理
          await dynamo.send(
            // 更新処理
            new PutCommand({
              TableName: "vue-app-1-blog",
              Item: {
                id: obj.id,
                open: obj.open,
                title: obj.title,
                body: obj.body,
                userId: obj.userId,
                username: obj.username,
                like: count[blogId]
              },
            })
          )
          resBody.push(`FIX LIKE ID ${blogId}: LIKE COUNT ${likeCount} TO ${count[blogId]}`)
        }
      } else {
        // 0件
        if (likeCount === 0) {
          resBody.push(`NO FIX ID ${blogId}: LIKE COUNT ${likeCount}`)
        } else {
          // FIX 処理
          await dynamo.send(
            // 更新処理
            new PutCommand({
              TableName: "vue-app-1-blog",
              Item: {
                id: obj.id,
                open: obj.open,
                title: obj.title,
                body: obj.body,
                userId: obj.userId,
                username: obj.username,
                like: 0
              },
            })
          )
          resBody.push(`FIX LIKE ID ${blogId}: LIKE COUNT ${likeCount} TO ${0}`)
        }
      }
    }

    statusCode = 200;
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
