const express = require('express');
const session = require('express-session');
const userRoutes = require('./routes/userRoutes');
const guestRoutes = require('./routes/guestRoutes');
const postRoutes = require('./routes/postRoutes')
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(cors({
    origin: 'http://localhost:8080',
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