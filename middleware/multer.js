const multer = require("multer");
const path = require("path");
const fs = require("fs");

// uploads 폴더 존재 여부 확인 및 생성 함수
const createUploadsFolder = (folderPath) => {
    if (!fs.existsSync(folderPath)) {
        console.log(`"${folderPath}" 폴더가 존재하지 않아 새로 생성합니다.`);
        fs.mkdirSync(folderPath, { recursive: true });
    }
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // console.log("요청 파일 저장 경로:", path.join(__dirname, "../uploads")); //디버깅용
        const uploadPath = path.join(__dirname, "../uploads");
        createUploadsFolder(uploadPath);
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        // console.log("업로드된 파일 이름:", uniqueName); //디버깅용
        cb(null, uniqueName);
    },
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        console.log("파일 타입:", file.mimetype);
        const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
        if (!allowedTypes.includes(file.mimetype)) {
            console.log("허용되지 않은 파일 타입입니다:", file.mimetype);
            return cb(new Error("Invalid file type"));
        }
        cb(null, true);
    },
    limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = upload;
