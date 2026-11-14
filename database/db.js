// Подключение к MySQL. Другие файлы берут отсюда готовое соединение:
//   const db = require("./db");

// читаем настройки из файла .env
require("dotenv").config();

const mysql = require("mysql2/promise");

// "пул" - это набор готовых соединений с базой, чтобы не открывать новое на каждый запрос
const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "autostart",
    charset: "utf8mb4",
    waitForConnections: true,
    connectionLimit: 10
});

module.exports = pool;
