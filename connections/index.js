const mongoose = require("mongoose"); // 引入 mongoose，用於連接 MongoDB
const dotenv = require("dotenv"); // 引入 dotenv，用來讀取環境變數

dotenv.config({ path: "./config.env" }); // 載入 .env 檔案環境變數
console.log(process.env.PORT); // PORT 變數 8082

// 從環境變數讀取 MongoDB 連線字串，並替換密碼
const DB = process.env.DATABASE.replace(
  "<PASSWORD>", // 取代 PASSWORD 為密碼
  process.env.DATABASE_PASSWORD
);

// 連接 MongoDB
mongoose
  .connect(DB)
  .then(() => {
    console.log("資料庫連線成功"); // 連線成功時執行
  })
  .catch((err) => {
    console.log("資料庫無法連線", err); // 連線失敗時輸出錯誤
    process.exit(); // 終止程式，避免持續執行
  });
