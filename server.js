import express from 'express';
import session from'express-session';
import userRoutes from'./routes/userRoutes.js';
import guestRoutes from'./routes/guestRoutes.js';
import postRoutes from './routes/postRoutes.js';
import cors from 'cors';
import path from'path';
import { fileURLToPath } from 'url';
import BASE_IP from './config.js';

// const BASE_IP = 'http://3.39.237.226:3001';
// const BASE_IP = 'localhost:3001';

const app = express();
const PORT = 3001;
const __dirname = path.dirname( fileURLToPath(import.meta.url) );

// cors 설정
app.use(cors({
    origin: `http://localhost:8080`,
    credentials: true,
}));

// 세션 설정
app.use(
    session({
        secret: 'siena_secretKey',
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,  // 클라이언트 JS에서 쿠키 접근 방지
            secure: false,   // HTTPS 환경에서 true로 설정
            sameSite: 'lax', // CSRF 방지
            maxAge: 1000 * 60 * 60, // 1시간
        },
    })
);

app.use((req, res, next) => {
    console.log(`Request URL: ${req.url}, Method: ${req.method}`);
    next();
});


app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.use(express.json());

app.use('/guest', guestRoutes);
app.use('/users', userRoutes);
app.use('/posts', postRoutes);

app.use('/images', express.static(path.join(__dirname, '../2-siena-eom-community-fe-1/images')));

// 서버 실행
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});