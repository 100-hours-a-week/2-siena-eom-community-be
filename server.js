import express from 'express';
import session from'express-session';
import userRoutes from'./routes/userRoutes.js';
import guestRoutes from'./routes/guestRoutes.js';
import postRoutes from './routes/postRoutes.js';
import cors from 'cors';
import path from'path';
import { fileURLToPath } from 'url';

const BASE_IP = 'http://3.39.237.226:3001';
// const BASE_IP = 'localhost:3001';
const app = express();
const PORT = 3001;
const __dirname = path.dirname( fileURLToPath(import.meta.url) );

// cors 설정
app.use(cors({
    origin: `${BASE_IP}`,
    credentials: true,
}));

// 세션 설정
app.use(
    session({
        secret: 'siena_secretKey',
        resave: false,
        saveUninitialized: false,
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