import multer from "multer";
import path from "path";
import { fileURLToPath } from 'url';

const __dirname = path.dirname( fileURLToPath(import.meta.url) );

import fs from "fs";

// uploads 폴더 존재 여부 확인 및 생성 함수
const createUploadsFolder = (folderPath) => {
    if (!fs.existsSync(folderPath)) {
        console.log(`"${folderPath}" 폴더가 존재하지 않아 새로 생성합니다.`);
        fs.mkdirSync(folderPath, { recursive: true });
    }
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, "../uploads");
        createUploadsFolder(uploadPath);
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const safeFileName = file.originalname
            .replace(/\s+/g, '-') // 공백을 '-'로 변환
            .replace(/[^a-zA-Z0-9.\-_]/g, ''); // URL-safe 문자만 허용
        cb(null, Date.now() + '-' + safeFileName); // 고유 파일 이름 생성
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

export default upload;
