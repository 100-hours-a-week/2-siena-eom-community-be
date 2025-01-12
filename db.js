import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// MariaDB 연결 설정
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4', // 한글 처리를 위해..
});

export default pool;
