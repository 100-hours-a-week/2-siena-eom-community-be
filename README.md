##### 2-siena-eom-community-be

## 💬 WeMessage

### 🗓️ 개발 기간 
2024.11 ~

### 📚 기술 스택
<img src="https://img.shields.io/badge/javascript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black"><img src="https://img.shields.io/badge/node.js-339933?style=for-the-badge&logo=Node.js&logoColor=white"><img src="https://img.shields.io/badge/express-000000?style=for-the-badge&logo=express&logoColor=white"><img src="https://img.shields.io/badge/mariaDB-003545?style=for-the-badge&logo=mariaDB&logoColor=white">


### 🚀 실행 방법
1. git clone

    ```bash
    git clone https://github.com/100-hours-a-week/2-siena-eom-community-be.git
    ````

2. 의존성 설치 `npm install`

3. 환경 변수 파일 작성 `.env`
```
DB_HOST= '데이터베이스 엔드포인트'
DB_USER= '유저명'
DB_PASSWORD= '비밀번호'
DB_NAME= '데이터베이스 이름'
DB_PORT= '데이터베이스 포트'

SECRET_KEY= '시크릿키'
```

4. 실행 `node server.js`

**프론트엔드 서버와 함께 실행시켜야 동작을 확인할 수 있습니다**

### 💾 ERD
<img width="984" alt="Image" src="https://github.com/user-attachments/assets/102a8023-1788-4023-981c-be82a1c25510" />

### 📁 파일 구조
```
2-SIENA-EOM-COMMUNITY-BE/
├── controllers
│   ├── postController.js
│   ├── userController.js
├── data                     # DB 연결 전 데이터 
│   ├── comments.json
│   ├── posts.json
│   └── users.json
├── middleware
│   ├── authMiddleware.js    # 인증 미들웨어
│   └── multer.js            # 파일 업로드 설정
├── models
│   ├── postModel.js
│   └── userModel.js
├── routes
│   ├── guestRoutes.js       # 비회원 라우트
│   ├── postRoutes.js        # 게시물 라우트
│   └── userRoutes.js        # 사용자 라우트
├── uploads                  # 업로드된 파일 저장소
├── .env                     # 환경변수 파일
├── config.js                # 설정 파일
├── db.js                    # 데이터베이스 관리
├── package.json
├── server.js                # 서버 엔트리 포인트
└── README.md
```

### [🖥️ 프론트엔드 레포지토리](https://github.com/100-hours-a-week/2-siena-eom-community-fe-1.git)
