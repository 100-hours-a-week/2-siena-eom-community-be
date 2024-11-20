const express = require('express');
const userRoutes = require('./routes/userRoutes');
const guestRoutes = require('./routes/guestRoutes');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());

// 미들웨어 설정
app.use(express.json());
app.use('/guest', guestRoutes);
app.use('/users', userRoutes);

app.use((req, res, next) => {
    console.log(`Request URL: ${req.url}, Method: ${req.method}`);
    next();
});

// 서버 실행
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

