import multer from "multer";
import multerS3 from 'multer-s3';
import { S3Client } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
dotenv.config();

// S3 클라이언트 설정
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const storage = multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET_NAME,
    metadata: (req, file, cb) => {
    cb(null, { fieldName: file.fieldname });
  },
  key: (req, file, cb) => {
    const safeFileName = file.originalname
      .replace(/\s+/g, '-') // 공백을 '-'로 변환
      .replace(/[^a-zA-Z0-9.\-_]/g, ''); // URL-safe 문자만 허용
    const uniqueFileName = `${Date.now()}-${safeFileName}`;
    cb(null, `uploads/${uniqueFileName}`); // S3 내 파일 경로 설정
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
